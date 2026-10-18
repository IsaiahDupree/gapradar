# Changelog

All notable changes to GapRadar — the hosted app-store-gap research relay and
its Stripe-billed plans.

## [Unreleased]

### Changed
- **Forked the GapRadar connector from the SecondBrainBridge relay scaffold — a
  cloud app-store-gap research SaaS (no Mac agent); wired to the DemandRadar
  Store Opportunity Engine.** GapRadar keeps the scaffold's OAuth 2.1
  (PKCE + DCR) relay and Stripe billing but drops any local agent: the flow is
  ChatGPT / Claude / Codex → GapRadar relay (Vercel) → DemandRadar backend
  (store-data adapters — Google Play via RapidAPI, Apple approved RSS + iTunes
  Search API, Microsoft Store). It now serves seven read-only research tools:
  `search_store_apps`, `compare_platform_availability`, `find_platform_gaps`
  (Pro), `analyze_app_reviews` (Pro), `score_app_opportunity`,
  `generate_build_dossier` (Pro), and `get_plan`.

### Added
- **Free / Builder / Pro / Studio tiers.** Free allows 5 opportunity checks/mo.
  Builder ($29/mo), Pro ($79/mo), and Studio ($249/mo) lift the caps; Pro
  unlocks `find_platform_gaps`, `analyze_app_reviews`, and
  `generate_build_dossier`. Plans are billed via Stripe; gating happens
  server-side from the plan stored in the relay.
- **Live store data via DemandRadar.** When `DEMANDRADAR_URL` and
  `DEMANDRADAR_API_KEY` are set, the tools query the live Store Opportunity
  Engine. Without them the relay runs in demo mode — reviewer accounts get
  sample opportunities, and real accounts get an honest "not connected to a live
  store-data source" notice instead of fabricated results.
- **Build dossiers.** `generate_build_dossier` (Pro) turns a scored opportunity
  into a Codex-ready build dossier. Positioning guardrail: every dossier
  describes a workflow-clone with original branding, UI, and code plus a real
  improvement — never a carbon-copy of an existing app.

## [1.3.0] — 2026-07-17

### Added
- **Connector token revocation.** Access tokens now carry a per-client id
  (`jti`) and a per-user revocation epoch. A dashboard card lists connected
  clients and lets you revoke one or invalidate every outstanding token at once.
  Endpoints: `GET /api/agent/devices`, `POST /api/agent/revoke`.

### Security
- Protected endpoints reject revoked tokens on the next request; legacy tokens
  (pre-1.3) are grandfathered until re-issued.

## [1.2.0] — 2026-07-17

### Added
- **Push-based relay path.** The relay streams DemandRadar results back the
  instant a query resolves, keeping round-trip overhead low.
- **Store-data read tools.** `search_store_apps`,
  `compare_platform_availability`, `find_platform_gaps`, and
  `analyze_app_reviews` return structured results (ranked apps, cross-platform
  availability, gap candidates, and review themes) to the connected assistant.
- **Email verification** via Resend (soft by default; opt-in enforcement via
  `REQUIRE_EMAIL_VERIFICATION`). `/verify`, `/api/resend-verification`, `/api/me`.
- Reviewer **demo mode** — the `reviewer@…` account exercises all tools against
  server-side sample opportunities with no live store-data source.
- **Rate limiting** on all auth/OAuth endpoints. Privacy & support pages.

### Security
- Adversarial auth + relay review; fixes: rate-limit IP no longer trusts the
  spoofable leftmost `X-Forwarded-For` (it takes the rightmost, closest hop);
  `JWT_SECRET` fails closed in production; login normalization + timing
  equalization; ownership check on results; atomic rate-limit TTL;
  password-length cap; `PUBLIC_BASE_URL` host pinning. See
  [SECURITY.md](./SECURITY.md).

### Added (project)
- Server unit tests, GitHub Actions CI, SECURITY.md.

## [1.1.0] — 2026-07-15

### Changed
- Storage moved from Upstash Redis to a Redis-shaped surface on Supabase
  Postgres. `JWT_SECRET` support.

## [1.0.0] — 2026-07-15

### Added
- Initial release of the relay scaffold: OAuth 2.1 + PKCE + DCR,
  streamable-HTTP MCP endpoint, job relay, and Supabase-backed storage for
  accounts and plans.

Releases: https://github.com/IsaiahDupree/gapradar/releases
