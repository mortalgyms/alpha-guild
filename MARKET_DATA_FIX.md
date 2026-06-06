# Markets Data Fix

This build fixes two Markets page issues:

- Crypto and Forex tabs are enabled and populated with BTC, ETH, SOL, XRP, EUR/USD, GBP/USD, USD/JPY, and AUD/USD.
- Charts no longer fail just because the Supabase Edge Function is unavailable.

## Data Flow

The frontend now tries providers in this order:

1. Supabase Edge Function `market-data`
2. Alpha Vantage browser fallback
3. Local synthetic fallback so the UI remains usable

## Vercel Environment Variable

For real Alpha Vantage fallback data, set this in Vercel:

```env
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

This key is visible in frontend JavaScript because Vite exposes `VITE_` variables to the browser. For production-grade secrecy, move Alpha Vantage calls into the Supabase Edge Function and store the key as a Supabase function secret.

## Supabase Edge Function

The Edge Function CORS helper was made local so the function does not rely on a remote CORS import.
