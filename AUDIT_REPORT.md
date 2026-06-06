# Alpha Guild Application Audit Report

Date: 2026-06-06

## Executive Summary

The application is a Vite React SPA with Supabase authentication, Supabase Edge Function market data, mock-backed trading/social/progression pages, and Vitest coverage. Critical deployment and runtime issues were reproduced, fixed, and retested:

- Google OAuth now uses direct Supabase OAuth.
- Markets page Crypto and Forex tabs are enabled and populated.
- Chart data no longer hard-fails when the Supabase Edge Function is unavailable.
- Lint errors were fixed.
- Dependency audit was reduced from 17 vulnerabilities to 0.
- Automated route, auth, and market-data regression tests were added.

## Architecture Discovery

- Frontend: React 18, Vite, React Router, shadcn/Radix UI, TailwindCSS, Recharts.
- Backend: Supabase client and one Supabase Edge Function: `market-data`.
- Database: Supabase migration defines `profiles`, `user_roles`, `app_role`, RLS policies, signup profile trigger, and role helper.
- Auth: Supabase email/password, signup, sign-out, session persistence, and Google OAuth.
- State: local React state, React Query provider, Supabase auth state.
- Market data: `src/lib/marketApi.ts` calls Supabase Edge Function, Alpha Vantage fallback, then synthetic fallback.
- Mock-backed modules: dashboard, guilds, leaderboard, messages, notifications, quests, signals, portfolio, learning.

## Issues Found And Fixed

### Critical: Dependency vulnerabilities

Evidence:

- `npm audit --audit-level=moderate` initially reported 17 vulnerabilities, including one critical Vitest advisory.

Fix:

- Ran audit fixes.
- Upgraded Vitest to `4.1.8`.
- Aligned Vite to compatible secure `7.3.5` so clean installs do not fail on peer conflicts.

Validation:

- `npm audit --audit-level=moderate` reports `found 0 vulnerabilities`.
- `npm ci --dry-run` passes.
- `npm run test` passes.
- `npm run build` passes.

### High: Market charts failed when Edge Function was unavailable

Evidence:

- User reported `Chart unavailable: Failed to send a request to the Edge Function`.
- `marketApi.ts` threw directly from `supabase.functions.invoke`.

Fix:

- Added Alpha Vantage fallback.
- Added synthetic fallback if Edge Function and Alpha Vantage both fail.
- Added regression tests for quote and candle fallback.

Validation:

- `src/test/marketApi.test.ts` forces both network layers to fail and verifies usable quotes/candles still return.

### High: Crypto and Forex tabs disabled

Evidence:

- `Markets.tsx` had `disabled` on Crypto and Forex tabs.
- The universe only contained stock symbols.

Fix:

- Added Crypto and Forex market filters.
- Added `BTCUSD`, `ETHUSD`, `SOLUSD`, `XRPUSD`, `EURUSD`, `GBPUSD`, `USDJPY`, and `AUDUSD`.

Validation:

- `src/test/route-smoke.test.tsx` verifies Crypto and Forex tabs are enabled and render market symbols.

### High: Google OAuth integration mismatch

Evidence:

- The Google button previously called Lovable cloud auth while application sessions are Supabase-backed.
- User saw Supabase provider and project URL errors during login attempts.

Fix:

- `Auth.tsx` now calls `supabase.auth.signInWithOAuth({ provider: "google" })` directly.
- Supabase client explicitly enables PKCE and URL session detection.

Validation:

- `src/test/auth.test.tsx` verifies Google login calls Supabase OAuth with `redirectTo: window.location.origin`.

### Medium: Lint blockers

Evidence:

- `npm run lint` initially failed with 6 errors.

Fix:

- Typed sidebar icons as `LucideIcon`.
- Replaced empty interfaces with type aliases.
- Removed `any` market news return type.
- Converted Tailwind plugin config to ESM imports.
- Fixed quote hook dependency handling.

Validation:

- `npm run lint` exits 0. Remaining warnings are shadcn-style Fast Refresh warnings.

## Test Results

- `npm run test`: 4 files passed, 20 tests passed.
- `npm run build`: passed.
- `npm run lint`: passed with 8 non-blocking Fast Refresh warnings.
- `npm audit --audit-level=moderate`: 0 vulnerabilities.
- `npm ci --dry-run`: passed.

## Security Report

Resolved:

- Dependency audit is clean.
- Google OAuth now uses Supabase directly.
- Supabase RLS exists for `profiles` and `user_roles`.

Remaining risks:

- `VITE_ALPHA_VANTAGE_API_KEY` is browser-visible because Vite exposes `VITE_` variables. Move market data calls into an Edge Function for production secrecy.
- Google provider must be enabled in Supabase dashboard.
- Vercel must use the correct Supabase URL/key for the active project.
- Phone login, MFA, password reset, admin authorization, rate limiting, and push notifications are not fully implemented.

## Performance Report

Observed:

- Production bundle builds successfully.
- Main JS chunk is about 676 kB and triggers Vite chunk-size warning.

Recommendations:

- Add route-level lazy loading.
- Split charting and Recharts-heavy pages into async chunks.
- Avoid polling too aggressively for market data in production.

## Accessibility Report

Observed:

- Radix UI components provide a good baseline for keyboard and ARIA behavior.
- Form labels exist on email/password fields.
- Icon-only buttons exist in trading controls and should receive explicit accessible labels before production.

Limitations:

- Full browser-based keyboard, screen-reader, and color-contrast testing was not available in this workspace.

## Product Feature Coverage

Implemented or visible:

- Trading dashboard, markets, signals, portfolio, journal, guilds, messages, leaderboard, quests, learning, notifications, settings, profile.

Mostly mock/static:

- Chat delivery, read receipts, typing indicators, guild membership, leaderboard calculations, XP, quests, notifications, portfolio execution, journal persistence.

Not found as implemented:

- Workout tracking, diet plans, streak saves, exercise library GIF rendering, gym history, avatar customization, phone login, OTP, MFA, password reset, admin management.

## Remaining Recommendations

- Deploy the Supabase `market-data` function and store provider keys as function secrets.
- Add real database tables and RLS for trades, guilds, messages, notifications, quests, XP logs, journals, workouts, streaks, and admin actions.
- Add Playwright or Cypress browser tests for mobile/desktop visual and interaction coverage.
- Add password reset, OTP, MFA, and provider-state tests.
- Add real-time Supabase channels or WebSockets for messages, notifications, and presence.
- Add bundle splitting to reduce the initial JS payload.
