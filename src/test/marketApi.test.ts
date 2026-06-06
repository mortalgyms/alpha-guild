import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCandles, fetchQuotes } from "@/lib/marketApi";

const invokeMock = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

describe("market data fallback", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    invokeMock.mockResolvedValue({ data: null, error: new Error("Failed to send a request to the Edge Function") });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network unavailable");
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns usable quotes when the Edge Function and Alpha Vantage fail", async () => {
    const quotes = await fetchQuotes(["BTCUSD", "EURUSD"]);

    expect(quotes).toHaveLength(2);
    expect(quotes[0].symbol).toBe("BTCUSD");
    expect(quotes[0].price).toBeGreaterThan(0);
    expect(quotes[1].symbol).toBe("EURUSD");
    expect(quotes[1].price).toBeGreaterThan(0);
  });

  it("returns usable candles when the Edge Function and Alpha Vantage fail", async () => {
    const candles = await fetchCandles("BTCUSD", "60", 14);

    expect(candles.s).toBe("ok");
    expect(candles.c.length).toBeGreaterThan(10);
    expect(candles.o).toHaveLength(candles.c.length);
    expect(candles.h).toHaveLength(candles.c.length);
    expect(candles.l).toHaveLength(candles.c.length);
  });
});
