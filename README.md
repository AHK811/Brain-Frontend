# Brain — frontend

Next.js (App Router) frontend for interacting with a 33M-parameter causal
language model hosted on a Hugging Face Space (Gradio, ZeroGPU).

Stack: Next.js + Tailwind + shadcn/ui + Clerk (auth) + Supabase (history) +
`@gradio/client` (inference).

## 1. Install

```bash
npm install
```

## 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with real values from each dashboard. **Never commit
this file or paste its contents anywhere else** — `.gitignore` already
excludes it.

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys (server-only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (server-only, bypasses RLS) |
| `HF_TOKEN` | huggingface.co → Settings → Access Tokens (only needed if the Space is private/gated) |
| `HF_SPACE_ID` | Your Space, e.g. `BraegnAI/Brain-o` |
| `HF_API_NAME` | The Gradio endpoint name — verify via `?view=api` (see below) |

## 3. Supabase schema

Open Supabase Dashboard → SQL Editor → New query, paste the contents of
`supabase/schema.sql`, and run it.

## 4. Verify the Gradio Space API contract before relying on `/api/generate`

Once `BraegnAI/Brain-o` is live:

```
https://huggingface.co/spaces/BraegnAI/Brain-o?view=api
```

or in a scratch Node script:

```js
import { Client } from '@gradio/client'
const client = await Client.connect('BraegnAI/Brain-o')
console.log(await client.view_api())
```

Confirm the real `api_name` and parameter keys, then update `HF_API_NAME`
and the `client.predict(apiName, { ... })` call in
`app/api/generate/route.ts` to match exactly. Until this is verified, the
route will return a 502 with an explanatory error — that's expected, not a
bug.

## 5. Run locally

```bash
npm run dev
```

## 6. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or via the Vercel dashboard: import this repo, then before the first
deploy go to **Project → Settings → Environment Variables** and add every
variable from `.env.local.example` with its real value (Production,
Preview, and Development scopes as needed). Vercel's environment variable
store is the correct place for these secrets — not a file in the repo, not
a chat message.

After adding env vars, trigger a deploy (or redeploy if you already
imported the project before adding them — env vars only apply to builds
that happen after they're set).

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` and `CLERK_SECRET_KEY` must never carry a
  `NEXT_PUBLIC_` prefix and must never be referenced from client
  components — only from Route Handlers / Server Components (this is
  already how `lib/supabase.ts` and `app/api/generate/route.ts` are
  written).
- If any of these keys are ever pasted into a chat, doc, screenshot, or
  committed to git history, treat them as compromised and rotate them in
  the issuing dashboard immediately, even for a prototype — a key doesn't
  know it's "just for testing."
