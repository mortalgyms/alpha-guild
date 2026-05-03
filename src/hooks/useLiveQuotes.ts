import { useEffect, useState } from "react";
import { fetchQuotes, type LiveQuote } from "@/lib/marketApi";

// Finnhub symbol notes:
//  - US stocks: plain ticker (AAPL, NVDA)
//  - Crypto: BINANCE:BTCUSDT
//  - Forex: OANDA:EUR_USD
export function useLiveQuotes(symbols: string[], intervalMs = 15000) {
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbols.length) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const data = await fetchQuotes(symbols);
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
  }, [symbols.join(","), intervalMs]);

  return { quotes, loading, error };
}
