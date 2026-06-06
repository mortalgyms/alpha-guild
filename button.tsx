import { useEffect, useMemo, useState } from "react";
import { fetchQuotes, type DataQuality, type LiveQuote } from "@/lib/marketApi";

const FINNHUB_WS_TOKEN = import.meta.env.VITE_FINNHUB_WS_TOKEN;

export function useLiveQuotes(symbols: string[], intervalMs = 15000) {
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<"disabled" | "connecting" | "live" | "error">(
    FINNHUB_WS_TOKEN ? "connecting" : "disabled"
  );
  const symbolKey = symbols.join(",");
  const stableSymbols = useMemo(() => symbolKey.split(",").filter(Boolean), [symbolKey]);

  useEffect(() => {
    if (!stableSymbols.length) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const data = await fetchQuotes(stableSymbols);
        if (cancelled) return;
        const map: Record<string, LiveQuote> = {};
        for (const q of data) map[q.symbol] = q;
        setQuotes(map);
        setError(null);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [stableSymbols, intervalMs]);

  useEffect(() => {
    if (!FINNHUB_WS_TOKEN || !stableSymbols.length || typeof WebSocket === "undefined") {
      setStreamStatus("disabled");
      return;
    }

    const mappedSymbols = stableSymbols.map(toFinnhubStreamSymbol).filter(Boolean);
    if (!mappedSymbols.length) {
      setStreamStatus("disabled");
      return;
    }

    let closedByEffect = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let ws: WebSocket | undefined;

    const connect = () => {
      setStreamStatus("connecting");
      ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_WS_TOKEN}`);

      ws.onopen = () => {
        setStreamStatus("live");
        mappedSymbols.forEach((symbol) => ws?.send(JSON.stringify({ type: "subscribe", symbol })));
      };

      ws.onmessage = (event) => {
        const packet = JSON.parse(event.data) as { type?: string; data?: { s: string; p: number; t: number; v?: number }[] };
        if (packet.type !== "trade" || !packet.data?.length) return;

        setQuotes((current) => {
          const next = { ...current };
          for (const trade of packet.data ?? []) {
            const symbol = fromFinnhubStreamSymbol(trade.s);
            const previous = next[symbol];
            const prevClose = previous?.prevClose || previous?.price || trade.p;
            next[symbol] = {
              symbol,
              price: trade.p,
              change: trade.p - prevClose,
              changePct: prevClose ? ((trade.p - prevClose) / prevClose) * 100 : 0,
              high: Math.max(previous?.high ?? trade.p, trade.p),
              low: Math.min(previous?.low ?? trade.p, trade.p),
              open: previous?.open ?? trade.p,
              prevClose,
              t: Math.floor(trade.t / 1000),
              meta: streamQuality(trade.t),
            };
          }
          return next;
        });
      };

      ws.onerror = () => setStreamStatus("error");
      ws.onclose = () => {
        if (closedByEffect) return;
        setStreamStatus("error");
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      closedByEffect = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      mappedSymbols.forEach((symbol) => ws?.send(JSON.stringify({ type: "unsubscribe", symbol })));
      ws?.close();
    };
  }, [stableSymbols]);

  return { quotes, loading, error, streamStatus };
}

function toFinnhubStreamSymbol(symbol: string) {
  const normalized = symbol.replace("/", "").toUpperCase();
  const map: Record<string, string> = {
    BTCUSD: "BINANCE:BTCUSDT",
    ETHUSD: "BINANCE:ETHUSDT",
    SOLUSD: "BINANCE:SOLUSDT",
    XRPUSD: "BINANCE:XRPUSDT",
    EURUSD: "OANDA:EUR_USD",
    GBPUSD: "OANDA:GBP_USD",
    USDJPY: "OANDA:USD_JPY",
    AUDUSD: "OANDA:AUD_USD",
  };
  return map[normalized] ?? normalized;
}

function fromFinnhubStreamSymbol(symbol: string) {
  const map: Record<string, string> = {
    "BINANCE:BTCUSDT": "BTCUSD",
    "BINANCE:ETHUSDT": "ETHUSD",
    "BINANCE:SOLUSDT": "SOLUSD",
    "BINANCE:XRPUSDT": "XRPUSD",
    "OANDA:EUR_USD": "EURUSD",
    "OANDA:GBP_USD": "GBPUSD",
    "OANDA:USD_JPY": "USDJPY",
    "OANDA:AUD_USD": "AUDUSD",
  };
  return map[symbol] ?? symbol;
}

function streamQuality(sourceTimestamp: number): DataQuality {
  const now = Date.now();
  const delayMs = Math.max(0, now - sourceTimestamp);
  const status = delayMs <= 90_000 ? "live" : delayMs <= 15 * 60_000 ? "delayed" : "stale";

  return {
    provider: "finnhub-edge",
    status,
    sourceTimestamp,
    sourceIso: new Date(sourceTimestamp).toISOString(),
    receivedAt: now,
    receivedIso: new Date(now).toISOString(),
    localTimestamp: now,
    localIso: new Date(now).toISOString(),
    delayMs,
    latencyMs: 0,
    isDelayed: status === "delayed",
    isStale: status === "stale",
    isSimulated: false,
    message: "Finnhub WebSocket trade stream",
  };
}
