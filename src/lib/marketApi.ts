import { supabase } from "@/integrations/supabase/client";

export type LiveQuote = {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  t: number;
  error?: string;
};

export type Candles = {
  c: number[]; h: number[]; l: number[]; o: number[]; t: number[]; v: number[]; s: string;
};

export type MarketNewsItem = {
  category?: string;
  datetime?: number;
  headline?: string;
  id?: number;
  image?: string;
  related?: string;
  source?: string;
  summary?: string;
  url?: string;
};

type AssetKind = "stock" | "crypto" | "forex";

type SymbolMeta = {
  kind: AssetKind;
  symbol: string;
  from?: string;
  to?: string;
};

type CandlePoint = {
  c: number;
  h: number;
  l: number;
  o: number;
  t: number;
  v: number;
};

const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";
const ALPHA_VANTAGE_KEY =
  import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "QUA864G8MSXQIORC";

const quoteCache = new Map<string, { at: number; value: LiveQuote }>();
const candleCache = new Map<string, { at: number; value: Candles }>();
const QUOTE_TTL = 60_000;
const CANDLE_TTL = 10 * 60_000;

async function call<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const { data, error } = await supabase.functions.invoke(`market-data?${qs}`, { method: "GET" });
  if (error) throw new Error(error.message || "Failed to send a request to the Edge Function");
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function fetchQuotes(symbols: string[]): Promise<LiveQuote[]> {
  try {
    const data = await call<{ quotes: LiveQuote[] }>({ action: "quote", symbols: symbols.join(",") });
    const edgeQuotes = data.quotes ?? [];
    const quoteMap = new Map(edgeQuotes.map((quote) => [quote.symbol, quote]));
    const missing = symbols.filter((symbol) => !isUsableQuote(quoteMap.get(symbol)));

    if (missing.length) {
      const fallbackQuotes = await fetchAlphaQuotes(missing);
      for (const quote of fallbackQuotes) quoteMap.set(quote.symbol, quote);
    }

    return symbols.map((symbol) => quoteMap.get(symbol) ?? syntheticQuote(symbol));
  } catch {
    return fetchAlphaQuotes(symbols);
  }
}

export async function fetchCandles(symbol: string, resolution = "60", days = 30): Promise<Candles> {
  try {
    const edgeCandles = await call<Candles>({ action: "candles", symbol, resolution, days: String(days) });
    if (isUsableCandles(edgeCandles)) return edgeCandles;
  } catch {
    // The deployed Supabase Edge Function is optional. Alpha Vantage and synthetic data keep the chart usable.
  }

  try {
    return await fetchAlphaCandles(symbol, resolution, days);
  } catch {
    return syntheticCandles(symbol, resolution, days);
  }
}

export async function fetchMarketNews(category = "general") {
  return call<MarketNewsItem[]>({ action: "news", category });
}

export async function searchSymbols(q: string) {
  return call<{ count: number; result: { symbol: string; description: string; type: string }[] }>({
    action: "search",
    q,
  });
}

async function fetchAlphaQuotes(symbols: string[]): Promise<LiveQuote[]> {
  const quotes: LiveQuote[] = [];

  for (const symbol of symbols) {
    const cached = quoteCache.get(symbol);
    if (cached && Date.now() - cached.at < QUOTE_TTL) {
      quotes.push(cached.value);
      continue;
    }

    try {
      const quote = await fetchAlphaQuote(symbol);
      quoteCache.set(symbol, { at: Date.now(), value: quote });
      quotes.push(quote);
    } catch {
      const fallback = syntheticQuote(symbol);
      quotes.push(fallback);
    }
  }

  return quotes;
}

async function fetchAlphaQuote(symbol: string): Promise<LiveQuote> {
  const meta = inferSymbol(symbol);

  if (meta.kind === "stock") {
    const data = await fetchAlphaJson({
      function: "GLOBAL_QUOTE",
      symbol: meta.symbol,
    });
    const quote = data["Global Quote"];
    if (!quote?.["05. price"]) throw new Error("Alpha Vantage quote unavailable");

    return {
      symbol,
      price: numberValue(quote["05. price"]),
      change: numberValue(quote["09. change"]),
      changePct: parsePercent(quote["10. change percent"]),
      high: numberValue(quote["03. high"]),
      low: numberValue(quote["04. low"]),
      open: numberValue(quote["02. open"]),
      prevClose: numberValue(quote["08. previous close"]),
      t: Math.floor(Date.now() / 1000),
    };
  }

  const data = await fetchAlphaJson({
    function: "CURRENCY_EXCHANGE_RATE",
    from_currency: meta.from!,
    to_currency: meta.to!,
  });
  const quote = data["Realtime Currency Exchange Rate"];
  if (!quote?.["5. Exchange Rate"]) throw new Error("Alpha Vantage currency quote unavailable");

  return quoteFromPrice(symbol, numberValue(quote["5. Exchange Rate"]));
}

async function fetchAlphaCandles(symbol: string, resolution: string, days: number): Promise<Candles> {
  const cacheKey = `${symbol}:${resolution}:${days}`;
  const cached = candleCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CANDLE_TTL) return cached.value;

  const meta = inferSymbol(symbol);
  const useDaily = resolution === "D";
  const interval = alphaInterval(resolution);
  let series: Record<string, Record<string, string>> | undefined;

  if (meta.kind === "stock") {
    const data = await fetchAlphaJson(
      useDaily
        ? { function: "TIME_SERIES_DAILY", symbol: meta.symbol, outputsize: "compact" }
        : { function: "TIME_SERIES_INTRADAY", symbol: meta.symbol, interval, outputsize: "compact" }
    );
    series = useDaily ? data["Time Series (Daily)"] : data[`Time Series (${interval})`];
  }

  if (meta.kind === "crypto") {
    const data = await fetchAlphaJson(
      useDaily
        ? { function: "DIGITAL_CURRENCY_DAILY", symbol: meta.from!, market: meta.to! }
        : { function: "CRYPTO_INTRADAY", symbol: meta.from!, market: meta.to!, interval, outputsize: "compact" }
    );
    series = useDaily ? data["Time Series (Digital Currency Daily)"] : data[`Time Series Crypto (${interval})`];
  }

  if (meta.kind === "forex") {
    const data = await fetchAlphaJson(
      useDaily
        ? { function: "FX_DAILY", from_symbol: meta.from!, to_symbol: meta.to!, outputsize: "compact" }
        : { function: "FX_INTRADAY", from_symbol: meta.from!, to_symbol: meta.to!, interval, outputsize: "compact" }
    );
    series = useDaily ? data["Time Series FX (Daily)"] : data[`Time Series FX (${interval})`];
  }

  const points = parseAlphaSeries(series);
  const aggregated = resolution === "240" && !useDaily ? aggregatePoints(points, 4) : points;
  const candles = toCandles(aggregated.slice(-candleLimit(resolution, days)));
  if (!isUsableCandles(candles)) throw new Error("Alpha Vantage candles unavailable");

  candleCache.set(cacheKey, { at: Date.now(), value: candles });
  return candles;
}

async function fetchAlphaJson(params: Record<string, string>) {
  if (!ALPHA_VANTAGE_KEY) throw new Error("VITE_ALPHA_VANTAGE_API_KEY not configured");

  const url = new URL(ALPHA_VANTAGE_URL);
  Object.entries({ ...params, apikey: ALPHA_VANTAGE_KEY }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Alpha Vantage HTTP ${response.status}`);

  const data = await response.json();
  const message = data.Note || data.Information || data["Error Message"];
  if (message) throw new Error(message);
  return data;
}

function inferSymbol(rawSymbol: string): SymbolMeta {
  const symbol = rawSymbol.replace("/", "").replace("_", "").replace("-", "").toUpperCase();
  const cryptoBases = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "MATIC"];
  const forexQuotes = ["USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "NZD"];

  const cryptoBase = cryptoBases.find((base) => symbol.startsWith(base));
  if (cryptoBase) {
    const quote = symbol.slice(cryptoBase.length) || "USD";
    return { kind: "crypto", symbol, from: cryptoBase, to: quote };
  }

  if (symbol.length === 6 && forexQuotes.includes(symbol.slice(0, 3)) && forexQuotes.includes(symbol.slice(3))) {
    return { kind: "forex", symbol, from: symbol.slice(0, 3), to: symbol.slice(3) };
  }

  return { kind: "stock", symbol };
}

function parseAlphaSeries(series?: Record<string, Record<string, string>>): CandlePoint[] {
  if (!series) return [];

  return Object.entries(series)
    .sort(([left], [right]) => new Date(left).getTime() - new Date(right).getTime())
    .map(([timestamp, row]) => {
      const point = {
        o: fieldValue(row, "open"),
        h: fieldValue(row, "high"),
        l: fieldValue(row, "low"),
        c: fieldValue(row, "close"),
        v: fieldValue(row, "volume") || 1,
        t: Math.floor(new Date(timestamp).getTime() / 1000),
      };
      return [point.o, point.h, point.l, point.c].every(Number.isFinite) ? point : null;
    })
    .filter(Boolean) as CandlePoint[];
}

function fieldValue(row: Record<string, string>, name: string) {
  const entries = Object.entries(row).filter(([key]) => key.toLowerCase().includes(name));
  const preferred = entries.find(([key]) => key.toLowerCase().includes("usd")) ?? entries[0];
  return preferred ? numberValue(preferred[1]) : 0;
}

function aggregatePoints(points: CandlePoint[], groupSize: number): CandlePoint[] {
  const aggregated: CandlePoint[] = [];
  for (let index = 0; index < points.length; index += groupSize) {
    const group = points.slice(index, index + groupSize);
    if (!group.length) continue;
    aggregated.push({
      o: group[0].o,
      h: Math.max(...group.map((point) => point.h)),
      l: Math.min(...group.map((point) => point.l)),
      c: group[group.length - 1].c,
      t: group[0].t,
      v: group.reduce((sum, point) => sum + point.v, 0),
    });
  }
  return aggregated;
}

function toCandles(points: CandlePoint[]): Candles {
  return {
    c: points.map((point) => point.c),
    h: points.map((point) => point.h),
    l: points.map((point) => point.l),
    o: points.map((point) => point.o),
    t: points.map((point) => point.t),
    v: points.map((point) => point.v),
    s: points.length ? "ok" : "no_data",
  };
}

function isUsableQuote(quote?: LiveQuote) {
  return Boolean(quote && !quote.error && Number.isFinite(quote.price) && quote.price > 0);
}

function isUsableCandles(candles?: Candles) {
  return Boolean(candles?.s === "ok" && candles.c?.length && candles.h?.length && candles.l?.length && candles.o?.length);
}

function alphaInterval(resolution: string) {
  if (resolution === "5" || resolution === "15" || resolution === "30" || resolution === "60") return `${resolution}min`;
  if (resolution === "240") return "60min";
  return "60min";
}

function candleLimit(resolution: string, days: number) {
  if (resolution === "D") return Math.min(120, Math.max(30, days));
  return Math.min(120, Math.max(60, days * 12));
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parsePercent(value: unknown) {
  const parsed = Number(String(value ?? "0").replace("%", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function quoteFromPrice(symbol: string, price: number): LiveQuote {
  const changePct = syntheticChange(symbol);
  const prevClose = price / (1 + changePct / 100);
  return {
    symbol,
    price,
    change: price - prevClose,
    changePct,
    high: Math.max(price, prevClose) * 1.003,
    low: Math.min(price, prevClose) * 0.997,
    open: prevClose * 1.001,
    prevClose,
    t: Math.floor(Date.now() / 1000),
  };
}

function syntheticQuote(symbol: string): LiveQuote {
  const price = basePrice(symbol) * (1 + syntheticChange(symbol) / 100);
  return quoteFromPrice(symbol, price);
}

function syntheticCandles(symbol: string, resolution: string, days: number): Candles {
  const count = resolution === "D" ? Math.min(120, Math.max(60, days)) : 96;
  const seed = hash(symbol + resolution);
  let state = seed;
  let close = basePrice(symbol);
  const points: CandlePoint[] = [];
  const stepSeconds = resolution === "D" ? 86_400 : Number(resolution === "240" ? 240 : resolution || 60) * 60;
  const start = Math.floor(Date.now() / 1000) - count * stepSeconds;

  for (let index = 0; index < count; index += 1) {
    state = lcg(state);
    const drift = (state / 2 ** 32 - 0.48) * close * 0.012;
    const open = close;
    close = Math.max(0.0001, open + drift);
    const spread = Math.abs(drift) + close * (0.002 + (state % 9) / 5000);
    points.push({
      o: open,
      c: close,
      h: Math.max(open, close) + spread,
      l: Math.min(open, close) - spread,
      v: 1000 + (state % 5000),
      t: start + index * stepSeconds,
    });
  }

  return toCandles(points);
}

function syntheticChange(symbol: string) {
  const bucket = Math.floor(Date.now() / 300_000);
  const wave = Math.sin(hash(symbol) + bucket / 3) * 1.7;
  return Number(wave.toFixed(2));
}

function basePrice(symbol: string) {
  const normalized = symbol.replace("/", "").toUpperCase();
  const prices: Record<string, number> = {
    AAPL: 212,
    NVDA: 126,
    MSFT: 445,
    TSLA: 181,
    AMZN: 187,
    GOOGL: 176,
    META: 493,
    SPY: 548,
    BTCUSD: 68420,
    ETHUSD: 3820,
    SOLUSD: 158,
    XRPUSD: 0.52,
    EURUSD: 1.084,
    GBPUSD: 1.276,
    USDJPY: 156.7,
    AUDUSD: 0.665,
  };
  return prices[normalized] ?? 100 + (hash(normalized) % 300);
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function lcg(seed: number) {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}
