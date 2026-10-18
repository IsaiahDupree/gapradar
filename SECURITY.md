# Security Policy

Thanks for helping keep GapRadar and its users safe.

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue.

- Email **isaiahdupree33@gmail.com** with subject `GapRadar security: <short summary>`, or
- Use GitHub's [private vulnerability reporting](https://github.com/IsaiahDupree/gapradar/security/advisories/new).

Include: affected component, a clear description, reproduction steps / PoC, and the impact you believe it has. We aim to acknowledge within 3 business days and to keep you updated through remediation. Please give us reasonable time to fix before any public disclosure. There is no paid bounty, but we're glad to credit reporters in the changelog.

## Scope

**In scope**
- The hosted relay: `https://getgapradar.vercel.app` (OAuth, token, MCP, and billing endpoints).
- This repository's code: `server/`, `kit/`.

**Out of scope**
- Denial-of-service / volumetric attacks (the endpoints are rate-limited; please don't stress-test production).
- Social engineering, spam, or issues in third-party infrastructure we don't control (Vercel, Supabase, Resend, Stripe, RapidAPI, and the Apple / Google / Microsoft stores, OpenAI).
- Self-XSS or issues only exploitable against your own account.

## Design details relevant to security

- **We don't store your private data.** GapRadar is a research connector: it queries **public** app-store and market data on demand and returns results. The server persists only account / auth records and your subscription plan — no user documents, no private content. GapRadar is a cloud service with no local agent and no device pairing.
- **All tools are read-only research.** The V1 tools (`search_store_apps`, `compare_platform_availability`, `find_platform_gaps`, `analyze_app_reviews`, `score_app_opportunity`, `generate_build_dossier`, `get_plan`) only read external store data and compute over it. There are no write operations, no money movement, and no trade or transaction execution.
- **Store data comes from licensed / approved sources.** GapRadar reads public store data through sanctioned channels only — Google Play via RapidAPI, and Apple via the approved RSS feeds plus the iTunes Search API (never scraped). It never bypasses a store's access controls, authentication, or rate limits, and it accesses nothing that isn't already public.
- **DemandRadar API key.** Live data is fetched from the DemandRadar Store Opportunity Engine using `DEMANDRADAR_API_KEY`, a server-side secret held in environment variables only. It is never exposed to the client and never leaves the relay. If it (and `DEMANDRADAR_URL`) are unset, the relay runs in demo mode rather than fabricating results.
- **Billing.** The relay stores the user's plan / subscription status (Free / Builder / Pro / Studio) so it can gate tools and caps server-side. Payment is handled by **Stripe** — no card data ever touches our servers.
- **Token model.** JWTs are HMAC-SHA256 signed with a server-only `JWT_SECRET`. Distinct kinds — `session` (dashboard) and `mcp` (the connected assistant's access token) — and each protected endpoint checks the required kind.
- **OAuth.** Authorization Code + PKCE (S256 required) with Dynamic Client Registration (RFC 7591). Authorization codes are single-use; `redirect_uri` must match a value the client registered.
- **Isolation.** Requests and any transient job state are keyed per user; one account never sees another's. The reviewer demo account operates on isolated server-side sample opportunities.
- **Secrets** are never committed; configuration lives in environment variables (see `server/.env.example`).

## Known limitations / accepted residual risk

These are understood trade-offs, not undiscovered bugs — documented for transparency:

- **Access tokens are long-lived but revocable.** Each carries a per-client id (`jti`) and the user's revocation epoch; a user can revoke one client (deletes its `jti`) or invalidate every outstanding token at once (bumps the epoch, invalidating everything outstanding). Revoked tokens are rejected on their next request. This per-device revocation machinery is inherited from the relay scaffold; because GapRadar has no local agent, device pairing is currently dormant.
- **Refresh tokens rotate on use but there is no reuse-family detection** (RFC 9700). A stolen-and-used refresh token hijacks the chain; the victim's next refresh then fails, surfacing the compromise.
- **Open Dynamic Client Registration** (required by MCP clients like ChatGPT) means any party can register a client; the consent screen shows the redirect host so users can spot a client that isn't first-party. This is standard OAuth and requires user interaction to abuse.
- **Fixed-window rate limiting** permits up to ~2× the nominal limit across a window boundary. Acceptable for the abuse-prevention it provides.

## Hardening review

The auth/OAuth and relay surfaces were reviewed for: JWT forgery/alg-confusion (mitigated — HMAC-only, signature always required), PKCE downgrade/replay (S256 enforced, codes single-use), open redirect (redirect_uri exact-matched), cross-user token minting and isolation (per-user keys, kind-scoped tokens, ownership checked on results), SQLi (parameterized RPCs), SSRF (fixed internal URLs, including the DemandRadar backend), and rate-limit spoofing (client IP taken from the platform's trusted headers — the rightmost, closest hop — not the client-controlled leftmost `X-Forwarded-For`).

If you're unsure whether something is in scope, email us and ask — we'd rather hear about it.
