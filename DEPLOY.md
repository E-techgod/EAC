# Deploying the portfolio to Vercel (with the live AI agent)

Your site is a static page plus one serverless function (`api/chat.js`) that powers the
"Ask the agent" terminal. The function is **provider-agnostic** — give it a **free Groq
or Gemini key** (or a paid Anthropic key) and it auto-detects which to use.

## What's in the repo
```
index.html      ← the portfolio (the agent calls /api/chat)
styles.css      ← styles
assets/         ← your résumé PDF
api/chat.js     ← Vercel serverless function (key stays server-side)
.env.example    ← example env var names for local reference
```

## 1. Push to GitHub
Commit everything and push to your repo. **Do not commit any API key** — it only lives in
Vercel's environment variables (step 3).

## 2. Import into Vercel
- vercel.com → **Add New → Project** → pick your GitHub repo.
- Framework preset: **Other** (it's a static site; no build step needed).
- Click **Deploy**. Vercel auto-detects `api/chat.js` as a serverless function.

## 3. Add ONE provider key  ← pick a free option
In Vercel → **Project → Settings → Environment Variables**, add **one** of these. The
function auto-detects in this order: Groq → Gemini → Anthropic.

| Provider | Env var name | Where to get a free key | Notes |
|---|---|---|---|
| **Groq** (recommended) | `GROQ_API_KEY` | console.groq.com → API Keys | Free tier, very fast Llama models |
| **Gemini** | `GEMINI_API_KEY` | aistudio.google.com → Get API key | Free tier |
| Anthropic | `ANTHROPIC_API_KEY` | console.anthropic.com | Paid |

Apply to **Production** (and Preview if you want), then **Redeploy** so the variable takes
effect (Deployments → ⋯ → Redeploy).

For local reference, the expected variable names are also documented in `.env.example`.

### Optional overrides
- `AGENT_PROVIDER` = `groq` | `gemini` | `anthropic` — force a provider instead of auto-detect.
- `GROQ_MODEL` — default `llama-3.3-70b-versatile`.
- `GEMINI_MODEL` — default `gemini-2.5-flash`.

## 4. (Free tiers) you're done — no spend cap needed
Groq and Gemini free tiers won't bill you; they just rate-limit. If you ever switch to the
paid Anthropic key, set a **monthly spend limit** under console.anthropic.com → Settings →
Limits. When any provider stops responding, the agent shows its graceful "email Elias
directly" fallback.

## Cost / abuse controls already built in
- **4 messages per visitor** — enforced in the UI *and* re-checked in `api/chat.js`
  (a request with more than 4 user turns is rejected).
- **Short max output** — capped at 600 tokens per reply.
- On free tiers, realistic cost for normal job-search traffic is **$0**.

## Testing
- Open your deployed URL, scroll to **Ask the agent**, and ask a question.
- The JSON response includes a `provider` field so you can confirm which one answered.
- If it falls back to "demo unavailable," check: key set under the right name? Redeployed?
  Free-tier rate limit hit? Function logs are under Vercel → your project → **Logs**.

## Changing the message limit later
- UI: in `index.html`, search for `MAX_MSGS = 4`.
- Server: in `api/chat.js`, search for `MAX_USER_TURNS = 4`.
- Keep both in sync. Also update the disclaimer text near `id="msgLeft"` in `index.html`.
