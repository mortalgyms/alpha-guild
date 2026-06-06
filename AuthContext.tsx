import type { Candles, LiveQuote } from "@/lib/marketApi";

export type SignalDirection = "LONG" | "SHORT";
export type SignalStatus = "accepted" | "rejected";

export type ValidatedSignal = {
  id: string;
  symbol: string;
  direction: SignalDirection;
  status: SignalStatus;
  confidence: number;
  timeframe: string;
  entry: number;
  target: number;
  stop: number;
  riskReward: number;
  setup: string;
  reason: string;
  sourceProvider: string;
  dataStatus: string;
  sourceTimestamp: number | null;
  generatedAt: number;
};

export function buildSignal(symbol: string, quote: LiveQuote | undefined, candles: Candles | undefined, timeframe = "1H"): ValidatedSignal {
  const generatedAt = Date.now();
  const base = {
    id: `${symbol}-${timeframe}-${generatedAt}`,
    symbol,
    direction: "LONG" as SignalDirection,
    status: "rejected" as SignalStatus,
    confidence: 0,
    timeframe,
    entry: quote?.price ?? 0,
    target: 0,
    stop: 0,
    riskReward: 0,
    setup: "No validated setup",
    sourceProvider: quote?.meta?.provider ?? candles?.meta?.provider ?? "unknown",
    dataStatus: quote?.meta?.status ?? candles?.meta?.status ?? "unknown",
    sourceTimestamp: quote?.meta?.sourceTimestamp ?? candles?.meta?.sourceTimestamp ?? null,
    generatedAt,
  };

  const freshnessProblem = freshnessRejection(quote, candles);
  if (freshnessProblem) return { ...base, reason: freshnessProblem };

  if (!quote || !candles || candles.s !== "ok" || candles.c.length < 20) {
    return { ...base, reason: "Insufficient verified candle history" };
  }

  const closes = candles.c;
  const highs = candles.h;
  const lows = candles.l;
  const volumes = candles.v;
  const smaFast = average(closes.slice(-5));
  const smaSlow = average(closes.slice(-20));
  const atr = average(highs.slice(-14).map((high, index) => high - lows[lows.length - 14 + index]));
  const volumeRatio = average(volumes.slice(-5)) / Math.max(1, average(volumes.slice(-20)));

  if (!Number.isFinite(atr) || atr <= 0) {
    return { ...base, reason: "Invalid volatility calculation" };
  }

  const direction: SignalDirection = quote.price >= smaFast && smaFast >= smaSlow ? "LONG" : "SHORT";
  const trendAligned = direction === "LONG" ? quote.price >= smaSlow : quote.price <= smaSlow;
  const stopDistance = atr * 1.25;
  const targetDistance = atr * 2.5;
  const entry = quote.price;
  const stop = direction === "LONG" ? entry - stopDistance : entry + stopDistance;
  const target = direction === "LONG" ? entry + targetDistance : entry - targetDistance;
  const riskReward = Math.abs((target - entry) / (entry - stop));

  if (!trendAligned || riskReward < 1.8) {
    return {
      ...base,
      direction,
      entry,
      stop,
      target,
      riskReward,
      reason: "Rejected: trend alignment or risk/reward threshold failed",
    };
  }

  const confidence = clamp(
    58 +
      (Math.abs(smaFast - smaSlow) / Math.max(atr, 0.0001)) * 8 +
      Math.min(12, Math.abs(quote.changePct ?? 0) * 2) +
      Math.min(10, Math.max(0, volumeRatio - 1) * 8),
    50,
    94
  );

  return {
    ...base,
    status: "accepted",
    direction,
    confidence: Math.round(confidence),
    entry,
    stop,
    target,
    riskReward,
    setup: `${direction === "LONG" ? "Bullish" : "Bearish"} trend continuation with verified candle freshness`,
    reason: "Accepted: fresh data, trend alignment, valid ATR, and risk/reward >= 1.8",
  };
}

export function buildSignals(symbols: string[], quotes: Record<string, LiveQuote>, candles: Record<string, Candles>, timeframe = "1H") {
  return symbols.map((symbol) => buildSignal(symbol, quotes[symbol], candles[symbol], timeframe));
}

function freshnessRejection(quote?: LiveQuote, candles?: Candles) {
  if (!quote?.meta) return "Rejected: quote timestamp metadata missing";
  if (!candles?.meta) return "Rejected: candle timestamp metadata missing";
  if (quote.meta.isSimulated || candles.meta.isSimulated) return "Rejected: simulated data cannot generate trade signals";
  if (quote.meta.isStale || candles.meta.isStale) return "Rejected: stale market data";
  if (quote.meta.status === "unknown" || candles.meta.status === "unknown") return "Rejected: unknown data freshness";
  if (quote.meta.status !== "live" || candles.meta.status !== "live") return "Rejected: delayed data cannot generate live trade signals";
  return null;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
