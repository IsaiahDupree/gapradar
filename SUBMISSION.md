# GapRadar — App Directory Submission Playbook

Everything needed to submit GapRadar to the OpenAI app directory (apps SDK /
connector review), what's already done, and what only the account owner can do.

## Status: what's built and verified

| Requirement | Status | Proof |
|---|---|---|
| MCP server, streamable HTTP, OAuth 2.1 + PKCE + DCR | ✅ live | `https://gapradar.vercel.app/mcp`; e2e suite |
| Privacy policy | ✅ live | https://gapradar.vercel.app/privacy (accurate: Supabase + Vercel + Stripe subprocessors; only public store data; no user private data retained) |
| Support page | ✅ live | https://gapradar.vercel.app/support |
| Rate limiting on auth + OAuth endpoints | ✅ live | signup 5/10min, login 10/10min, authorize 30/10min, token 60/min, register 20/hr — 429 verified in e2e |
| **Reviewer demo mode** | ✅ live | Any account with email `reviewer@gapradar.demo` runs all 7 tools against a built-in set of sample opportunities and is treated as **paid** — so `find_platform_gaps`, `analyze_app_reviews`, and `generate_build_dossier` work too, 24/7 with **no store-data backend configured**. Real accounts are unaffected. Verified in e2e (search / compare / gaps / reviews / score / dossier with no live source). |
| **Stripe billing (Free / Builder / Pro / Studio)** | ✅ live | Free tier capped at 5 opportunity checks/month; paid plans (Builder $29, Pro $79, Studio $249) unlock cross-platform gap detection, review clustering, dossiers, and API — gated by Stripe subscription (test mode). `get_plan` surfaces the plan + `/upgrade` link. When Stripe is unconfigured, every account is treated as paid. |
| Onboarding UX | ✅ live | Sign-in + plan picker + connector instructions at the root URL |
| 512×512 icon | ✅ | `assets/icon-512.png` |
| OAuth tool scan | ✅ live | Form "Scan Tools" completes the OAuth consent and discovers all 7 tools |
| Domain verification | ✅ live | `/.well-known/openai-apps-challenge` (`server/api/challenge.js`) — form shows "Domain verified" |
| Complete tool annotations | ✅ | All 7 tools declare readOnly/idempotent/openWorld hints; none are destructive (0 form warnings) |
| Full e2e suite | ✅ 22 green checks | `node test/e2e-oauth.mjs` |

## Steps only the account owner can do

*(Portal flow verified live 2026-07-17: the submission form is at
`platform.openai.com/plugins` → **Create plugin** → **With MCP**. It is gated by
identity verification — clicking Create plugin shows "Complete identity
verification — you need a verified developer identity before you can create or
upload a plugin." That check requires a government ID / selfie and can only be
done by you.)*

1. **Complete developer identity verification.** platform.openai.com → **Plugins**
   → **Create plugin** → **With MCP** → **Continue** on the "Complete identity
   verification" dialog, and finish the ID check (or do it up front at Settings →
   Organization → **Verifications**). Requires the Owner role. *(Note: the org
   already shows a base "Verified" status, but plugin creation needs this
   developer-identity tier on top of it.)*
2. **Keep the demo credentials handy** for the form:
   - Email: `reviewer@gapradar.demo`
   - Password: the `DEMO_PASSWORD` value in `.env.local` (already created &
     verified — do not rotate it after submitting; reviewers use it)
3. **Create the plugin & fill the form.** Back at Plugins → Create plugin →
   With MCP → Standard → Continue. The editor has **seven** sections, advanced
   by the bottom **Continue** button (not the top tabs). Verified end-to-end on
   the live portal 2026-07-17:

   1. **Info** — name, ≤30-char subtitle, description, Category + Developer
      Identity (custom comboboxes), author, Website/Support/Privacy/Terms URLs,
      Demo Recording URL (required — the hosted screen-recording link), two icon
      uploads. All paste-ready in **LISTING.md**.
   2. **MCP** — MCP Server URL `https://gapradar.vercel.app/mcp`;
      Authentication **OAuth** (auto-discovers config from our `/.well-known`
      metadata); **Domain verification** — the form issues a token you must
      serve at `/.well-known/openai-apps-challenge` (our `server/api/challenge.js`
      already does this) then click **Verify Domain**; **Scan Tools** — opens an
      "Authorize MCP" OAuth consent (sign in with the reviewer demo account,
      Allow) and then discovers all 7 tools; **Tool justification** — one line
      per annotation per tool (Read Only / Open World) explaining why it's
      accurate (all 7 are read-only market-research tools).
   3. **Skills** — none; click **Skip**.
   4. **Prompts** — up to 3 showcase prompts (search the stores for a workflow /
      find a Windows→Mac platform gap / generate a build dossier).
   5. **Testing** — reviewer demo credentials (email + `DEMO_PASSWORD`), exactly
      **5 positive** test cases (scenario / user prompt / tool / expected) and
      exactly **3 negative** test cases (scenario + prompt where the app should
      *not* trigger). The demo account is treated as paid, so the
      `find_platform_gaps`, `analyze_app_reviews`, and `generate_build_dossier`
      cases all work.
   6. **Global** — English (US) translation is prefilled from Info; Allowed
      Countries = Allow all.
   7. **Submit** — Release Notes, then the policy-compliance checkboxes and the
      mature-content radio (**the account owner's legal attestations**), which
      enable **Submit for Review**.

## Directory listing copy

All paste-ready form values (name, tagline, description, URLs, demo credentials,
test prompts + expected responses, OAuth endpoints) live in **LISTING.md**.

*(Copy names the Apple App Store, Google Play, and Microsoft Store descriptively /
nominatively only; the product name and branding contain no third-party marks.)*

## Review risks & mitigations

- **Copycat / policy risk (the important one).** A "find gaps to build" tool could
  be misread as helping clone top apps. Mitigation: GapRadar's positioning is
  **workflow-clone, not carbon-copy** — it surfaces an underserved workflow and
  helps design an **original, meaningfully improved** product (own branding, UI,
  code, plus at least one real improvement), and it **declines requests to clone or
  duplicate a specific named app 1:1**. This is stated in the description, the
  release notes, one negative test case, and the consent copy. Apple, Google, and
  OpenAI reject copycats; GapRadar's guardrail is aligned with that.
- **Demo mode / current state.** Live data requires the deployment to set
  `DEMANDRADAR_URL` + `DEMANDRADAR_API_KEY` (the DemandRadar Store Opportunity
  Engine). Until then GapRadar runs in **demo mode**: the reviewer account answers
  against bundled sample opportunities, and real queries return a clear *"not
  connected to a live store-data source"* message rather than fabricated numbers.
  The app is fully reviewable in this state, and going live is one config away.
  This is stated honestly in the listing and privacy copy.
- **Third-party trademarks (Apple App Store, Google Play, Microsoft Store, Codex).**
  Used descriptively / nominatively only; no logos are used; the product name has
  no marks; the icon is generic (a radar sweep).
- **Data sourcing.** Only public market and store data via licensed / approved
  sources — Google Play via RapidAPI; Apple via approved RSS feeds + the iTunes
  Search API (never scraped, and rankings are never generated from scraped Apple
  data); Microsoft Store via a compliant public collector. **No user private
  data.** Documented in the privacy policy.
- **Latency.** A tool call round-trips to the DemandRadar backend and normalizes
  three stores (~1.5–4s typical). Within MCP norms; the server caps waits so
  nothing hangs.
- **Paid tier.** Paid plans are billed by Stripe outside ChatGPT; the Free tier is
  fully functional (search / compare / basic score, 5 checks/month) and the
  reviewer demo account is treated as paid so every tool is reviewable. `get_plan`
  discloses the current plan and the `/upgrade` link, and the description states
  the Free-vs-paid split up front.
- **No destructive tools.** All 7 tools are read-only research/report actions;
  nothing on the user's systems is written or modified.

## Fallback plan

If the directory review is rejected or slow: nothing is lost. The developer-mode
connector keeps working exactly as it does today for the owner and anyone who
creates an account on the dashboard and adds the connector in their MCP client —
the submission only affects public discoverability.

## Automation

`kit/submit-plugin.mjs` drives the submission form in the agent Chrome (CDP :9222),
config-driven from `kit/submission.config.json`. It walks Create plugin → With MCP
→ Standard → the multi-section editor, fully automates the **App Info** section
(name, ≤30-char subtitle, description, Category + Developer Identity comboboxes,
author, all four URLs, icon uploads), fills later sections best-effort, detects
which required fields still block "Continue", and **stops before "Submit for review"**.

```bash
cd kit && npm install
node submit-plugin.mjs                                   # fill the form, stop before submit
DRAFT_URL="https://platform.openai.com/plugins/edit/..." \
  node submit-plugin.mjs                                 # resume an existing draft
SUBMIT=1 node submit-plugin.mjs                          # also click Submit for review
```

Two fields the script can only flag, not fill: **developer identity verification**
(step 1) and the **Demo Recording URL** (a hosted screen-recording of the connector
working — put it in `submission.config.json`). Full details + the companion
connector automation: **[kit/README.md](./kit/README.md)**.

## Re-verify before submitting

```bash
node test/e2e-oauth.mjs        # 22 checks, includes demo-mode + rate limits
curl -s https://gapradar.vercel.app/api/health   # jwtSecretSet true; storeSourceConfigured reflects demo vs live
```
