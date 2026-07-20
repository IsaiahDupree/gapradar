# Contributing to GapRadar

Thanks for your interest! GapRadar is two small pieces — the Vercel relay
(`server/`) and the connector kit (`kit/`). It is a cloud service with no local
agent: the relay speaks OAuth 2.1 + MCP to ChatGPT / Claude / Codex and proxies
read-only research calls to the DemandRadar Store Opportunity Engine.
Contributions of any size are welcome.

## Getting set up

```bash
git clone https://github.com/IsaiahDupree/gapradar
cd gapradar

# server (relay)
cd server && cp .env.example .env.local   # fill in Supabase + JWT_SECRET
                                          # (+ DEMANDRADAR_URL / DEMANDRADAR_API_KEY for live data)
npm install                                # for local tests
node --test test-server-unit.mjs           # runs in-memory (no live DB needed)
```

The unit tests are the fast inner loop; run them before opening a PR. The
end-to-end test (`test/e2e-oauth.mjs`) runs against a live deployment and reads
`.env.local` — you only need it if you're changing the OAuth/MCP flow. Without
`DEMANDRADAR_URL` / `DEMANDRADAR_API_KEY` the relay runs in demo mode, so most
tool work can be done without a live store-data source.

## Guidelines

- **Match the surrounding style.** No formatter is enforced; keep the existing
  two-space indent and sparse, constraint-explaining comments.
- **No secrets in the repo.** Configuration lives in environment variables
  (`.env.example` documents them); `.env.local` is gitignored. The DemandRadar
  API key (`DEMANDRADAR_API_KEY`) is a server-side secret — it stays in env only,
  is never sent to the client, and never lands in the repo.
- **Keep the tools read-only.** The V1 tools are research-only: they read public
  store data and compute over it. Don't add writes, money movement, or
  store-side actions without a security review.
- **Respect the positioning guardrail.** Build dossiers describe a
  workflow-clone — original branding, UI, and code plus a real improvement —
  never a carbon-copy of an existing app.
- **Add or update tests** for behavior changes; keep CI green (syntax check +
  the server unit suite run on every push).
- **Security-sensitive changes** (auth, tokens, billing/plan gating, the
  DemandRadar API-key handling, the relay's isolation) deserve extra care — see
  [SECURITY.md](./SECURITY.md). Report vulnerabilities privately, don't open a
  public issue.

## Pull requests

Keep PRs focused, describe what changed and why, and flag anything you couldn't
test. By contributing you agree your work is licensed under the repository's
[MIT License](./LICENSE).
