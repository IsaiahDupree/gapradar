<div align="center">

# 📡 GapRadar

**Find app-store gaps worth building — before you spend weeks coding.**

[![License: MIT](https://img.shields.io/badge/License-MIT-f5b942.svg)](./LICENSE)
[![Category: Developer Tools](https://img.shields.io/badge/category-Developer%20Tools-4ade80.svg)](#)
[![Built on DemandRadar](https://img.shields.io/badge/engine-DemandRadar-3b82f6.svg)](https://github.com/IsaiahDupree/google-demand-radar)

</div>

GapRadar is a [Model Context Protocol](https://modelcontextprotocol.io) (MCP) connector that turns ChatGPT, Claude, or Codex into a **market-intelligence and product-decision layer for app builders.** It compares the **Apple App Store, Google Play, and Microsoft Store** — rankings, ratings, reviews, pricing, and cross-platform availability — to surface underserved app opportunities, then turns the strongest one into an evidence-backed, **Codex-ready build dossier.**

It is a fully **hosted, cloud** connector. There is no desktop app to install and nothing to run locally — you sign in, subscribe, add GapRadar as an MCP connector, and ask it to find gaps.

```
  ChatGPT / Claude / Codex  ──OAuth──►  GapRadar (Vercel)  ──►  DemandRadar Store Opportunity Engine
       (MCP connector)                  (auth · plans · 7 tools)      Apple App Store  (approved RSS + iTunes Search API)
                                                                      Google Play      (via RapidAPI)
                                                                      Microsoft Store  (compliant public collector)
```

GapRadar reads **only public market and store data** through licensed / approved sources. It never reads your private data, and it never scrapes Apple. It is built on the [DemandRadar Store Opportunity Engine](https://github.com/IsaiahDupree/google-demand-radar).

> **Build original, not copycat.** GapRadar helps you discover an underserved *workflow* and design an **original, meaningfully improved** product for it — your own branding, UI, and code, plus at least one real improvement. It does **not** clone, copy, or duplicate a specific top app, and it declines requests to do so. Apple, Google, and OpenAI reject copycats; so does GapRadar.

---

## For users — 3 steps

**1. Create your account** at **[getgapradar.vercel.app](https://getgapradar.vercel.app)** and pick a plan (Free to start, no card required).

**2. Add the connector.** In your MCP client, add a custom connector pointing at the GapRadar MCP Server URL and sign in with OAuth:

- **ChatGPT:** Settings → **Connectors** → turn on **Developer mode** → **Create** a custom connector → paste **`https://getgapradar.vercel.app/mcp`** → Authentication **OAuth** → sign in & **Allow**.
- **Claude / Codex:** add the same URL as a custom MCP connector and authorize via OAuth.

**3. Ask it to find gaps.** In a new chat:

> *"Find file-rename tools that are proven on Windows but underserved on Mac, cluster what reviewers complain about, score the best opportunity, and if it's a build, generate a Codex-ready dossier."*

That's it — no local agent, no pairing, no files on your machine. Everything runs in the cloud against public store data.

> **Demo mode vs. live data.** A live deployment needs a store-data source configured (`DEMANDRADAR_URL` + `DEMANDRADAR_API_KEY`). Until that's set, GapRadar runs in **demo mode**: it answers against a built-in set of sample opportunities, and the market tools return a clear *"not connected to a live store-data source"* message instead of inventing numbers. Going live is one config away.

---

## What it can do

| Tool | Action | Plan |
|------|--------|------|
| `search_store_apps` | Search Apple App Store, Google Play, and Microsoft Store for apps matching a query; returns ranked matches with ratings and pricing | Free |
| `compare_platform_availability` | Show where a product or workflow exists — and where it's absent or weak — across all three platforms | Free |
| `score_app_opportunity` | Score an opportunity 0–100 with a factor breakdown (demand, competition gap, review pain, monetization, feasibility) → a clear **build / no-build** verdict | Free (basic) |
| `find_platform_gaps` | Find workflows proven on one platform but underserved on another (e.g. Windows → Mac) and return ranked opportunities | **Paid** |
| `analyze_app_reviews` | Cluster the complaints and feature-requests in a category's reviews so you know exactly what to improve | **Paid** |
| `generate_build_dossier` | Turn the winning opportunity into a **Codex-ready build plan** — original angle, differentiators, scope, and handoff notes | **Paid** |
| `get_plan` | Show your current plan, usage, and an upgrade link | Free |

The **decision layer** — a build/no-build verdict plus a Codex / AppFleet handoff — is what sets GapRadar apart from chart-watching and download-estimate tools. Those tell you *what's popular*; GapRadar tells you *what's worth building next, and hands you a plan to build it.*

Any **paid** plan (Builder and up) unlocks `find_platform_gaps`, `analyze_app_reviews`, and `generate_build_dossier`. All seven tools are read-only: they produce research and reports, and never write to your systems.

---

## Plans

GapRadar is free to start. Upgrade when you want cross-platform gap detection, review clustering, and build dossiers. Billing is handled by **[Stripe](https://stripe.com)**.

| Plan | Price | What you get |
|---|---|---|
| **Free** | $0 | 5 opportunity checks / month — `search_store_apps`, `compare_platform_availability`, and a basic `score_app_opportunity` |
| **Builder** | **$29/mo** | 40 deep scans / mo · cross-platform gap detection · review clustering · 5 build dossiers · Codex export · weekly gap digest |
| **Pro** | **$79/mo** | 200 scans / mo · unlimited dossiers · historical trends · multi-country · new-gap alerts · Codex + AppFleet exports · API access |
| **Studio** | **$249/mo** | 5 seats · 1,000 scans / mo · white-label reports · full API · AppFleet / GitHub-Codex handoffs |
| **Enterprise** | Custom | Volume, SSO, custom sources, SLAs |

Run `get_plan` in any chat to see your current plan plus an upgrade link. The server enforces the Free monthly cap and gates the paid tools by your Stripe subscription. Upgrade at **[getgapradar.vercel.app/upgrade](https://getgapradar.vercel.app/upgrade)**.

> When Stripe is **not** configured (e.g. a self-hosted instance), every account is treated as **paid** so all seven tools are available.

---

## Self-hosting

You can run your own GapRadar so nothing depends on the hosted instance.

**Prereqs:** a [Vercel](https://vercel.com) account, a [Supabase](https://supabase.com) project (free tiers are fine), and access to a [DemandRadar Store Opportunity Engine](https://github.com/IsaiahDupree/google-demand-radar) deployment for live data.

1. **Storage** — in your Supabase project's SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql). It creates the accounts, plans, and monthly usage-counter tables (`gr_*`) with RLS on.
2. **Deploy** the `server/` directory to Vercel.
3. **Set env vars** (see [`server/.env.example`](./server/.env.example)):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — your project + service-role key
   - `JWT_SECRET` — `openssl rand -hex 32`
   - `DEMANDRADAR_URL`, `DEMANDRADAR_API_KEY` — your store-data source. **Omit to run in demo mode** (sample opportunities only).
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — for the paid tiers (optional; when omitted, every account is treated as paid).
4. **Verify:** `curl https://YOUR-APP.vercel.app/api/health` → `jwtSecretSet`, `storeSourceConfigured` (false = demo mode), and `stripeConfigured` reflect your setup.
5. Add the connector in your MCP client pointing at `https://YOUR-APP.vercel.app/mcp`.

---

## How it works

- **Auth** — OAuth 2.1 with PKCE and Dynamic Client Registration (RFC 7591). Your MCP client registers itself, the user signs in on the GapRadar consent page, and the client receives a scoped MCP access token. JWTs are HMAC-signed in two kinds (`session`, `mcp`) with distinct privileges. Optional email verification via Resend (`RESEND_API_KEY`); off unless configured, and enforcement is opt-in (`REQUIRE_EMAIL_VERIFICATION`).
- **Tools** — an MCP tool call → GapRadar checks the account's plan and monthly usage cap → calls the **DemandRadar Store Opportunity Engine** → normalizes rankings, ratings, reviews, and pricing across Apple, Google Play, and Microsoft into one comparable view → returns the result. The Free monthly cap is enforced here, and the paid tools (`find_platform_gaps`, `analyze_app_reviews`, `generate_build_dossier`) are unlocked based on the account's Stripe subscription. When `DEMANDRADAR_URL` isn't configured, the market tools run in **demo mode** against bundled sample opportunities and real queries return a clear *"not connected to a live store-data source"* message.
- **Data sources** — Google Play via **RapidAPI**; Apple via **approved RSS feeds + the iTunes Search API** (never scraped, and rankings are never generated from scraped Apple data); Microsoft Store via a **compliant public collector**. Only public market data is used — **no user private data** is read or stored.

## Repository layout

```
server/    Vercel functions: OAuth + MCP endpoint + the 7 tools + DemandRadar client + Stripe billing   (deploy this)
kit/       Browser automations: register the dev-mode connector AND
           fill the OpenAI directory submission (see kit/README.md)
supabase/  schema.sql — accounts, plans, and monthly usage counters (self-hosting)
test/      end-to-end OAuth + MCP integration test
```

## Development

```bash
# server
cd server && cp .env.example .env.local   # fill in, then: vercel dev
# end-to-end test against a live deployment (reads ../.env.local)
node test/e2e-oauth.mjs
```

## Security & privacy

- GapRadar reads **only public market and store data** through licensed / approved sources (Google Play via RapidAPI; Apple via approved RSS + the iTunes Search API — never scraped; Microsoft Store via a compliant public collector). **No user private data** is ever read or stored.
- **Build original, not copycat.** GapRadar surfaces underserved workflows and helps you design an original, meaningfully improved product; it never clones a specific app 1:1 and declines copycat requests.
- All seven tools are **read-only** research/report actions. GapRadar is a cloud connector — nothing runs on the user's machine and no files are touched.
- Paid tiers are billed by **Stripe** outside the chat client. The Free tier is fully functional.
- No secrets are committed; see [`.gitignore`](./.gitignore) and the `.env.example` files.

## License

[MIT](./LICENSE) © Isaiah Dupree · Dupree Ops LLC
