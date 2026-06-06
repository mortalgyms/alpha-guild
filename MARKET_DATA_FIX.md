# Markets Data Fix

This build fixes two Markets page issues:

- Crypto and Forex tabs are enabled and populated with BTC, ETH, SOL, XRP, EUR/USD, GBP/USD, USD/JPY, and AUD/USD.
- Charts no longer fail just because the Supabase Edge Function is unavailable.

## Data Flow

The frontend now tries providers in this order:

1. Optional Finnhub WebSocket overlay for subscribed live trade updates when `VITE_FINNHUB_WS_TOKEN` is configured.
2. Supabase Edge Function `market-data` for Finnhub REST quotes/candles.
3. Alpha Vantage browser fallback.
4. Local synthetic fallback so the UI remains usable.

Every quote and candle response now carries provider, source timestamp, received timestamp, local timestamp, delay, and freshness status metadata.

## Vercel Environment Variable

For real Alpha Vantage fallback data, set this in Vercel:

```env
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
VITE_FINNHUB_WS_TOKEN=your-finnhub-token
```

These keys are visible in frontend JavaScript because Vite exposes `VITE_` variables to the browser. For production-grade secrecy, move provider calls into the Supabase Edge Function and store provider keys as Supabase function secrets.

## Supabase Edge Function

The Edge Function CORS helper was made local so the function does not rely on a remote CORS import.

## Signals

Signals are no longer mock data. The signal engine rejects simulated, stale, unknown, or delayed market data before calculating entry, stop, target, ATR, trend alignment, risk/reward, and confidence.
