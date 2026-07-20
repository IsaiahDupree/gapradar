# GapRadar — paste-ready submission answers

Fill the OpenAI plugin submission form (platform.openai.com/plugins → **Create
plugin** → **With MCP**) with the values below. Fields verified against the live
portal on 2026-07-17. Requires developer identity verification first (see
SUBMISSION.md).

---

## Connection

| Field | Value |
|---|---|
| MCP Server URL | `https://gapradar.vercel.app/mcp` |
| Authentication | OAuth |
| OAuth — the portal auto-discovers these from the URL's `/.well-known` metadata | authorization: `https://gapradar.vercel.app/oauth/authorize` · token: `https://gapradar.vercel.app/api/oauth/token` · registration (DCR): `https://gapradar.vercel.app/api/oauth/register` · PKCE S256 · scope `research` |

After entering the URL, click **Scan Tools** — it should discover all 7 tools.

## Listing (App Info section — exact fields on the live form)

| Field | Value |
|---|---|
| **Name** | GapRadar |
| **Subtitle** ⚠️ ≤30 chars | `Find app-store gaps to build` |
| **Category** | Developer Tools |
| **Developer Identity** | Business — Dupree Ops LLC *(the verified identity; requires ID verification first)* |
| **Plugin Author** | Isaiah Dupree |
| **Website URL** | `https://gapradar.vercel.app` |
| **Customer support URL** | `https://gapradar.vercel.app/support` |
| **Privacy policy URL** | `https://gapradar.vercel.app/privacy` |
| **Terms of Service URL** | `https://gapradar.vercel.app/terms` |
| **Demo Recording URL** ⚠️ required | *(a hosted screen-recording of the connector working — you must record this)* |
| **Directory icon / composer icon** | `assets/icon-512.png` (512×512 PNG) |
| **Commerce & Purchasing** | leave unchecked — paid plans are billed externally by Stripe, not through ChatGPT |

**Description:**
> GapRadar finds app-store gaps worth building — before you spend weeks coding. It compares the Apple App Store, Google Play, and Microsoft Store — rankings, ratings, reviews, pricing, and cross-platform availability — to surface underserved app opportunities, then turns the strongest one into a Codex-ready build dossier. Ask it to find a workflow that's proven on one platform but underserved on another, cluster what reviewers actually complain about, score the opportunity 0–100 with a clear **build / no-build** verdict, and generate an evidence-backed build plan you can hand to Codex or AppFleet. That decision layer plus the build-plan handoff is what sets GapRadar apart from chart-watching and download-estimate tools. **Free** covers 5 opportunity checks a month (search, compare, basic score); **paid plans (Builder $29/mo, Pro $79/mo, Studio $249/mo, billed by Stripe)** add cross-platform gap detection, review clustering, unlimited dossiers, historical trends, and API access — run `get_plan` any time to see your plan and upgrade link. GapRadar reads only public market and store data through licensed/approved sources (Google Play via RapidAPI; Apple via approved RSS + the iTunes Search API — never scraped; Microsoft Store via a compliant public collector) and never touches your private data. It helps you discover an underserved workflow and design an **original, meaningfully improved** product — your own branding, UI, and code — and it declines requests to clone or copy a specific app. Fully hosted; no desktop app to install.

*These values are also encoded in [`kit/submission.config.json`](./kit/submission.config.json), which `kit/submit-plugin.mjs` fills automatically.*

## Demo / reviewer account (no MFA)

> GapRadar is a hosted, cloud connector — there is nothing to install. For review,
> sign in with the account below. It runs every tool against a built-in set of
> **sample opportunities** and is treated as **paid**, so all 7 tools (including
> the paid-only `find_platform_gaps`, `analyze_app_reviews`, and
> `generate_build_dossier`) work 24/7 with **no store-data backend configured**
> (demo mode). Sample opportunities include *"Native Mac batch file renamer"*
> (strong on Windows, weak on Mac, score **87**) and *"Mac clipboard manager with
> reliable cloud sync"* (score **78**), each with cross-store apps, review
> clusters, opportunity scores, and build dossiers.

- Email: `reviewer@gapradar.demo`
- Password: *(the `DEMO_PASSWORD` value in `.env.local` — paste it here at submission)*

## Test prompts & expected responses

Sign in as the reviewer account (it's treated as paid, so every tool works), add
the connector via OAuth, then run this end-to-end flow against the sample
opportunities. It exercises all 7 tools.

### Positive test cases (5)

1. **"Search the app stores for file-rename apps."** → `search_store_apps` (`"rename"`) →
   `{ "results": [ { "id": "win-bulk-rename", "name": "Bulk Rename Utility", "platform": "microsoft", "rating": 4.6, "ratings_count": 12000 }, { "id": "mac-renamer-x", "name": "Renamer X", "platform": "apple", "rating": 3.4, "ratings_count": 210 } ] }`
2. **"Where does batch file renaming exist across Apple, Google Play, and Microsoft?"** → `compare_platform_availability` (`"rename"`) →
   `{ "workflow": "batch file renaming", "availability": { "microsoft": { "apps": 14, "top_rating": 4.6 }, "google_play": { "apps": 9, "top_rating": 4.3 }, "apple": { "apps": 3, "top_rating": 3.4 } } }`
3. **"Find file-rename opportunities proven on Windows but underserved on Mac."** → `find_platform_gaps` (`windows`→`mac`, **paid**) →
   `{ "opportunities": [ { "id": "mac-batch-renamer", "title": "Native Mac batch file renamer", "proven_on": "windows", "underserved_on": "mac", "score": 87 }, { "id": "mac-clipboard-sync", "title": "Mac clipboard manager with reliable cloud sync", "score": 78 } ] }`
4. **"What do reviewers complain about in existing Mac renamers?"** → `analyze_app_reviews` (`"mac-batch-renamer"`, **paid**) →
   `{ "clusters": [ { "theme": "no true recursive/batch rename", "mentions": 63, "type": "feature_request" }, { "theme": "crashes on large folders", "mentions": 41, "type": "complaint" }, { "theme": "no regex / pattern support", "mentions": 29, "type": "feature_request" } ] }`
5. **"Score the Native Mac batch file renamer, and if it's a build, generate a Codex-ready dossier."** → `score_app_opportunity` (`"mac-batch-renamer"`) then `generate_build_dossier` (**paid**) →
   `{ "score": 87, "verdict": "build", "breakdown": { "demand": 22, "competition_gap": 24, "review_pain": 19, "monetization": 12, "feasibility": 10 } }` followed by `{ "dossier": { "working_title": "RenameKit for Mac", "original_angle": "recursive, regex-first batch renaming with a live preview — an original UI, not a clone", "differentiators": ["true recursive rename", "regex + token templates", "handles 10k+ files without crashing"], "codex_ready": true } }`

Finally, **"What plan am I on?"** → `get_plan` → returns the current plan (**paid**
for the demo account) and the upgrade link, confirming the Free-vs-paid gating.

## Negative test cases (exactly 3 — prompts where GapRadar should NOT trigger)

1. **Abstract idea with no research** — *"What app should I build to get rich?"* —
   there is no workflow or market to analyze; GapRadar surfaces opportunities from
   real store evidence, it does not invent product ideas out of thin air.
2. **A request to actually build or ship the app** — *"Build this Mac renamer and
   submit it to the App Store for me."* — GapRadar produces research and a build
   dossier only; it does not write, compile, or submit apps. Hand the dossier to
   Codex or AppFleet.
3. **A request to clone a specific named app 1:1** — *"Make me an exact copy of
   [PopularApp]."* — GapRadar declines copycatting. It finds underserved workflows
   and designs an **original, meaningfully improved** product — never a duplicate.

## Free vs. paid & the "workflow, not copy" guardrail

- **Free** = 5 opportunity checks / month (`search_store_apps`,
  `compare_platform_availability`, basic `score_app_opportunity`). **Builder
  $29/mo**, **Pro $79/mo**, and **Studio $249/mo** (all Stripe) unlock
  `find_platform_gaps`, `analyze_app_reviews`, `generate_build_dossier`, higher
  scan limits, historical data, and API access. The reviewer demo account is
  treated as paid so all 7 tools are reviewable with no backend.
- **Workflow-clone, not carbon-copy.** GapRadar publicly helps you *discover an
  underserved workflow and design an original, meaningfully improved product* —
  your own branding, UI, and code, plus at least one real improvement. It never
  clones, copies, or duplicates a top app, and it declines such requests, because
  Apple, Google, and OpenAI reject copycats.

## Release notes (first release)

> Initial release. GapRadar is a hosted MCP connector that finds app-store gaps
> worth building. It compares the Apple App Store, Google Play, and Microsoft
> Store — rankings, ratings, reviews, pricing, and cross-platform availability —
> to surface underserved opportunities, clusters what reviewers complain about,
> scores each opportunity 0–100 into a build/no-build verdict, and generates a
> Codex-ready build dossier. Free to start (search, compare, basic score — 5
> checks/month); paid plans (Builder $29/mo, Pro $79/mo, Studio $249/mo via
> Stripe) add cross-platform gap detection, review clustering, unlimited dossiers,
> and API access. Reads only public market and store data through licensed/approved
> sources; never touches private data. Helps you build an original, improved
> product — never a clone. No desktop app to install.

## Tools declared (7)

`search_store_apps`, `compare_platform_availability`, `score_app_opportunity`,
`find_platform_gaps` (paid), `analyze_app_reviews` (paid),
`generate_build_dossier` (paid), `get_plan`. All 7 are **read-only** (they produce
research/reports and never write to the user's systems), so none are annotated
destructive. `find_platform_gaps`, `analyze_app_reviews`, and
`generate_build_dossier` require a paid subscription; the reviewer demo account is
treated as paid so all three work.
