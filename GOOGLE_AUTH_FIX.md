# Google Login Fix

This build changes the Google button to use Supabase OAuth directly instead of the Lovable cloud-auth bridge.

## Code Change

- `src/pages/Auth.tsx` now calls:
  - `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })`
- `src/integrations/supabase/client.ts` now explicitly enables:
  - `detectSessionInUrl`
  - `flowType: "pkce"`

## Required Vercel Environment Variables

Set these in Vercel Project Settings > Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Then redeploy the project.

## Required Supabase Settings

In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: your production Vercel URL
- Redirect URLs:
  - your production Vercel URL
  - your production Vercel URL with `/*`
  - optional local dev URL such as `http://localhost:5173/*`

## Required Google Cloud Settings

In Google Cloud Console > OAuth Client:

- Authorized JavaScript origins:
  - your production Vercel URL
- Authorized redirect URIs:
  - your Supabase callback URL:
    - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`

The Google redirect URI is the Supabase callback URL, not the Vercel app URL.
