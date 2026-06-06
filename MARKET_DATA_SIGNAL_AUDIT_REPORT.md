# Market Data and Signal Accuracy Audit Report

Date: 2026-06-06

## Executive Summary

The market-data and signal stack has been upgraded from a UI-first implementation into a safer validation-first pipeline.

Implemented outcomes:

- Quotes and candles now carry provider, source timestamp, received timestamp, local timestamp, delay, and freshness status metadata.
- Charts and Markets views display source/received/local timestamps and delay.
- Crypto and Forex markets are enabled and supported in the symbol map.
- Chart failures from the Supabase Edge Function now fall back to Alpha Vantage, then clearly marked synthetic data.
- Optional Finnhub WebSocket streaming was added for live trade updates when `VITE_FINNHUB_WS_TOKEN` is configured.
- The Signals page no longer uses mock signals. It validates live data, trend, volatility, volume, risk/reward, stop, target, and confidence.
- Signals now reject simulated, stale, unknown, or delayed provider data.
- Tests cover data fallback, freshness metadata, signal rejection, and 500-symbol signal batch processing.

Production readiness status: safer for demo and staged deployments, but not production-ready for institutional execution until a deployed server-side market-data feed with paid/reliable exchange entitlements is configured and verified during live market sessions.

## 1. Current Data Source Audit

Current providers in the app:

| Layer | Provider | Location | Purpose | Timestamp source | Freshness handling |
| --- | --- | --- | --- | --- | --- |
| WebSocket overlay | Finnhub WebSocket | `src/hooks/useLiveQuotes.ts` | Optional live trade price overlay | WebSocket trade timestamp | Marks live, delayed, or stale by local delay |
| REST primary | Supabase Edge Function wrapping Finnhub REST | `supabase/functions/market-data/index.ts` | Quotes and candles | Finnhub quote/candle timestamps | Adds metadata server-side |
| REST fallback | Alpha Vantage | `src/lib/marketApi.ts` | Browser fallback for stocks, forex, crypto | Quote/candle response timestamps where available | Adds metadata client-side |
| UI fallback | Synthetic local generator | `src/lib/marketApi.ts` | Keeps UI usable when providers fail | Local generated timestamp | Always marked `simulated` |
| Cache | In-memory client cache | `src/lib/marketApi.ts` | Reduces repeat calls | Preserves cached source timestamp | Provider `cache`, status recomputed |

Polling intervals:

- Watchlist quote polling: `useLiveQuotes(symbols, 15000)` on Markets and Signals.
- Candle fetches: requested by chart/timeframe and by Signals revalidation.
- Optional WebSocket: event-driven updates plus automatic reconnect after disconnect/error.

Symbol mapping:

- Stocks: direct symbols such as `AAPL`, `NVDA`, `SPY`.
- Crypto WebSocket map: `BTCUSD -> BINANCE:BTCUSDT`, `ETHUSD -> BINANCE:ETHUSDT`, `SOLUSD -> BINANCE:SOLUSDT`, `XRPUSD -> BINANCE:XRPUSDT`.
- Forex WebSocket map: `EURUSD -> OANDA:EUR_USD`, `GBPUSD -> OANDA:GBP_USD`, `USDJPY -> OANDA:USD_JPY`, `AUDUSD -> OANDA:AUD_USD`.
- Alpha Vantage fallback maps crypto/forex into its required `from` and `to` currency fields.

Timestamp model:

- Source timestamp: provider market timestamp.
- Received timestamp: local client or Edge Function timestamp when response was processed.
- Local timestamp: current browser/client timestamp when metadata was generated.
- Delay: `localTimestamp - sourceTimestamp`.
- Status thresholds: live <= 90 seconds, delayed <= 15 minutes, stale beyond threshold, simulated for generated fallback data.

## 2. Signal Accuracy Findings

Original finding:

- The prior Signals page used static mock `aiSignals` from `src/lib/mockData.ts`.
- Mock signals had confidence, entry, and PnL-like UI values but no connection to current candles, quotes, provider timestamps, risk/reward validation, or market freshness.

Implemented signal engine:

- New module: `src/lib/signalEngine.ts`.
- Inputs: `LiveQuote`, `Candles`, symbol, timeframe.
- Validation gates:
  - Reject missing quote metadata.
  - Reject missing candle metadata.
  - Reject simulated data.
  - Reject stale data.
  - Reject unknown data freshness.
  - Reject delayed data for live signal generation.
  - Reject insufficient candle history.
  - Reject invalid volatility calculation.
  - Reject failed trend alignment or risk/reward threshold.
- Calculations:
  - Entry: current verified quote price.
  - Stop: entry +/- ATR-lite volatility distance.
  - Target: entry +/- reward distance.
  - Risk/reward: absolute target distance divided by stop distance.
  - Trend alignment: fast SMA versus slow SMA and quote position versus slow SMA.
  - Confidence: bounded score using trend spread, quote change percentage, and volume confirmation.

Important limitation:

- This is a guarded technical-signal engine, not a fully institutional quant model. It prevents stale/simulated/delayed data from becoming actionable, but it still needs backtesting, exchange-specific calendars, slippage modeling, liquidity filters, and broker execution validation before real-money use.

## 3. Live Data Verification Results

Implemented verification surfaces:

- Markets page displays status/provider badges per active quote.
- Markets page displays source time, received time, local time, and delay.
- Candle chart displays provider, freshness status, candle count, source timestamp, received timestamp, local timestamp, and delay.
- Signals page shows stream status and separates accepted setups from rejected candidates with rejection reasons.

Local verification:

- Automated tests verify quote/candle fallbacks return usable data.
- Automated tests verify synthetic data is explicitly marked simulated.
- Automated tests verify signal rejection for simulated, stale, and delayed data.
- Automated tests verify 500-symbol signal batch generation.

Live provider verification not completed in this local workspace:

- No deployed Supabase Edge Function invocation with production secrets was available from this sandbox.
- No live exchange-session browser test was completed against Vercel.
- No direct provider account dashboard was available to confirm current entitlement level or exchange delays.

Because of that, the app now makes freshness visible and refuses unsafe signals, but final live-data certification must be done in the deployed environment with real provider tokens.

## 4. Finnhub Assessment

Finnhub is useful as the current free/developer primary provider because:

- It supports REST market-data endpoints used by the Edge Function.
- It provides WebSocket trade streams for US stocks, forex, and crypto.
- Its docs state API limit handling through HTTP 429 responses and a 30 API calls/second cap across plans.

Risks:

- Exchange entitlement and plan limits can affect real-time availability.
- REST polling alone is not enough for true live dashboards.
- Browser-exposed tokens are not acceptable for production secrecy.
- Free/developer plans should not be treated as institutional data feeds.

Implementation decision:

- Keep Finnhub as the primary server-side REST source.
- Add optional Finnhub WebSocket overlay for live quote updates when `VITE_FINNHUB_WS_TOKEN` exists.
- Keep Alpha Vantage as fallback, not as the live signal authority.
- Reject delayed data from signal acceptance.

Reference: https://finnhub.io/docs/api/websocket-trades

## 5. Alternative Provider Evaluation

| Provider | Free usefulness | WebSocket | Coverage | Notes |
| --- | --- | --- | --- | --- |
| Finnhub | Good developer/demo fit | Yes | Stocks, forex, crypto | Best current fit for this code because Edge Function already uses Finnhub and WebSocket can overlay live updates |
| Alpha Vantage | Good REST fallback | No first-class app WebSocket in this code | Stocks, forex, crypto, commodities, indicators | Some real-time/delayed entitlements are premium or entitlement-controlled; browser key is visible |
| Twelve Data | Strong candidate | Yes | Broad global assets | Good alternative if a new provider account/tier is selected; docs emphasize WebSocket streaming |
| Polygon / Massive | Strong professional candidate | Yes | US market data, crypto, options depending plan | Better for production-grade US market apps, but useful real-time access usually depends on paid entitlements |
| Yahoo/Stooq/unofficial APIs | Useful for fallback/research | Limited/unofficial | Varies | Not recommended for production live trading signals |
| Exchange-native feeds | Best for crypto live execution | Yes | Exchange-specific | Recommended for crypto execution-grade latency and exchange timestamp fidelity |

Selected best available free/practical path for this app:

- Keep Finnhub primary because it is already wired into the Edge Function and supports WebSocket trade streaming.
- Use Alpha Vantage only as REST fallback and chart continuity layer.
- For production, upgrade to a server-side paid market-data feed or exchange-native feed rather than relying on browser-side free REST APIs.

References:

- Alpha Vantage docs: https://www.alphavantage.co/documentation/
- Twelve Data WebSocket docs: https://twelvedata.com/docs/websocket/ws-real-time-price
- Polygon/Massive WebSocket docs: https://polygon.io/docs/websocket/stocks/overview

## 6. Real-Time Streaming Implementation

Added in `src/hooks/useLiveQuotes.ts`:

- Optional `VITE_FINNHUB_WS_TOKEN`.
- WebSocket connection to `wss://ws.finnhub.io`.
- Symbol subscription mapping for selected stocks, crypto, and forex.
- Live quote overlay on incoming trade events.
- `streamStatus`: `disabled`, `connecting`, `live`, or `error`.
- Automatic reconnect after disconnect.
- Timestamp quality generated from incoming trade timestamps.

Current limits:

- Live candle synthesis from tick stream is not yet implemented.
- WebSocket heartbeat messages are provider-dependent and not yet surfaced as a separate health object.
- Notifications for feed failures are not yet wired into the app notification center.

## 7. Frontend Validation

Markets:

- Crypto and Forex tabs are active.
- Active symbol quote panel displays freshness metadata.
- Stream status is shown in the page subtitle.

Charts:

- Candle chart no longer fails only because the Edge Function is unavailable.
- Chart metadata makes stale/simulated/delayed status visible.

Signals:

- Signals are generated from validated live quote/candle data only.
- Rejected signals remain visible with reasons, so the user can distinguish "no valid setup" from "system broken".

## 8. Automated Monitoring

Implemented:

- UI stream status from WebSocket connection lifecycle.
- Provider metadata on every quote/candle.
- Signal-level rejection reasons for data quality failures.
- Synthetic fallback explicitly marked as simulated.

Recommended next monitoring work:

- Add a central feed-health store with per-symbol last tick age.
- Send notification-center alerts for disconnects, missing candles, and stale symbols.
- Add Supabase or server logs for provider 429s and failed invocations.
- Add provider-latency telemetry and alert thresholds.

## 9. Performance Results

Automated local performance coverage:

- Added a 500-symbol signal batch test.
- Build and test suite pass locally.

What remains unverified:

- WebSocket stability with 10, 50, 100, and 500 live provider subscriptions.
- CPU and memory profile in a real browser over a long-running live session.
- Provider subscription limits for the configured Finnhub account.

## 10. Files Modified

- `.gitignore`
- `.env.example`
- `MARKET_DATA_FIX.md`
- `MARKET_DATA_SIGNAL_AUDIT_REPORT.md`
- `src/lib/marketApi.ts`
- `src/lib/signalEngine.ts`
- `src/hooks/useLiveQuotes.ts`
- `src/pages/Markets.tsx`
- `src/pages/Signals.tsx`
- `src/components/trading/CandleChart.tsx`
- `src/test/marketApi.test.ts`
- `src/test/signalEngine.test.ts`
- `supabase/functions/market-data/index.ts`

## 11. Validation Commands

Run from the project root:

```bash
npm run test
npm run build
npm run lint
npm audit --audit-level=moderate
npm ci --dry-run
```

Last local validation after the market-data/signal changes:

- `npm.cmd run test`: passed.
- `npm.cmd run build`: passed.
- `npm.cmd run lint`: passed with existing Fast Refresh warnings.
- `npm.cmd audit --audit-level=moderate`: 0 vulnerabilities.
- `npm.cmd ci --dry-run`: passed.

## 12. Deployment Configuration

Required Vercel variables:

```env
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
VITE_ALPHA_VANTAGE_API_KEY=...
VITE_FINNHUB_WS_TOKEN=...
```

Security note:

- Any `VITE_` variable is visible in browser JavaScript.
- For production, move Alpha Vantage and Finnhub calls server-side into Supabase Edge Functions and store provider keys as Supabase secrets.
- `.env` and `.env.*` are ignored; `.env.example` is safe to commit.

## 13. Remaining Risks

- Provider data may still be delayed depending on account entitlements.
- Alpha Vantage free/default quote timestamps can be trading-day level for equities.
- Live candle aggregation from WebSocket ticks is not implemented yet.
- Market calendars and exchange-specific open/closed status are not fully modeled.
- No broker execution, slippage, spread, liquidity, or fill simulation is implemented.
- No long-running browser soak test was completed in this local workspace.
- This platform should not be used for real-money institutional execution without a proper licensed market-data feed, broker sandbox testing, compliance review, and production observability.

## 14. Production Readiness Status

Status: staging-ready with guardrails, not institutional-production-ready.

The code now behaves safely when data is unavailable, simulated, stale, delayed, or unknown. It surfaces provider freshness to the user and prevents invalid data from creating accepted trade setups. The remaining gap is external: production readiness requires verified live provider entitlements, server-side secrets, deployed Edge Functions, WebSocket soak testing, and execution-grade data validation.
