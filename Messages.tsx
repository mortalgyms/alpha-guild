import { describe, expect, it } from "vitest";
import { buildSignal, buildSignals } from "@/lib/signalEngine";
import type { Candles, DataQuality, LiveQuote } from "@/lib/marketApi";

describe("signal freshness validation", () => {
  it("accepts a technically valid setup only when quote and candles are fresh", () => {
    const quote = quoteWithQuality("live", false, 132);
    const candles = candlesWithQuality("live", false, 100, 1);

    const signal = buildSignal("NVDA", quote, candles);

    expect(signal.status).toBe("accepted");
    expect(signal.riskReward).toBeGreaterThanOrEqual(1.8);
    expect(signal.confidence).toBeGreaterThan(0);
  });

  it("rejects simulated data", () => {
    const quote = quoteWithQuality("simulated", true);
    const candles = candlesWithQuality("simulated", true, 100, 1);

    const signal = buildSignal("BTCUSD", quote, candles);

    expect(signal.status).toBe("rejected");
    expect(signal.reason).toMatch(/simulated/i);
  });

  it("rejects stale data", () => {
    const quote = quoteWithQuality("stale", false);
    const candles = candlesWithQuality("stale", false, 100, 1);

    const signal = buildSignal("EURUSD", quote, candles);

    expect(signal.status).toBe("rejected");
    expect(signal.reason).toMatch(/stale/i);
  });

  it("rejects delayed data for live signal generation", () => {
    const quote = quoteWithQuality("delayed", false, 132);
    const candles = candlesWithQuality("delayed", false, 100, 1);

    const signal = buildSignal("SPY", quote, candles);

    expect(signal.status).toBe("rejected");
    expect(signal.reason).toMatch(/delayed/i);
  });

  it("processes a 500 symbol signal batch", () => {
    const symbols = Array.from({ length: 500 }, (_, index) => `SYM${index}`);
    const quotes = Object.fromEntries(symbols.map((symbol) => [symbol, quoteWithQuality("live", false, 132)]));
    const candles = Object.fromEntries(symbols.map((symbol) => [symbol, candlesWithQuality("live", false, 100, 1)]));

    const startedAt = performance.now();
    const signals = buildSignals(symbols, quotes, candles);
    const elapsedMs = performance.now() - startedAt;

    expect(signals).toHaveLength(500);
    expect(signals.every((signal) => signal.status === "accepted")).toBe(true);
    expect(elapsedMs).toBeLessThan(1000);
  });
});

function quoteWithQuality(status: DataQuality["status"], simulated: boolean, price = 125): LiveQuote {
  return {
    symbol: "NVDA",
    price,
    change: 2,
    changePct: 1.6,
    high: price + 1,
    low: 121,
    open: 122,
    prevClose: price - 2,
    t: Math.floor(Date.now() / 1000),
    meta: quality(status, simulated),
  };
}

function candlesWithQuality(status: DataQuality["status"], simulated: boolean, base: number, step: number): Candles {
  const points = Array.from({ length: 30 }, (_, index) => base + index * step);
  return {
    s: "ok",
    c: points,
    o: points.map((value) => value - 0.5),
    h: points.map((value) => value + 1),
    l: points.map((value) => value - 1),
    t: points.map((_, index) => Math.floor(Date.now() / 1000) - (30 - index) * 60),
    v: points.map((_, index) => 1000 + index * 10),
    meta: quality(status, simulated),
  };
}

function quality(status: DataQuality["status"], simulated: boolean): DataQuality {
  const now = Date.now();
  return {
    provider: simulated ? "synthetic" : "finnhub-edge",
    status,
    sourceTimestamp: now,
    sourceIso: new Date(now).toISOString(),
    receivedAt: now,
    receivedIso: new Date(now).toISOString(),
    localTimestamp: now,
    localIso: new Date(now).toISOString(),
    delayMs: 0,
    latencyMs: 0,
    isDelayed: status === "delayed",
    isStale: status === "stale",
    isSimulated: simulated,
  };
}
