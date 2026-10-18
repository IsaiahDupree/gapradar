// demoStore.js — a server-side sample dataset for the reviewer/demo account.
// Lets reviewers exercise every GapRadar tool 24/7 with no live store-data
// backend. Result shapes mirror what the DemandRadar client returns, so ChatGPT
// sees the same formats whether a call was served here or by DemandRadar. The
// data is illustrative sample intelligence, clearly a demo — never presented as
// live rankings.

export const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'reviewer@gapradar.demo').toLowerCase();

// A few cross-store apps for search + platform comparison.
const APPS = [
  { id: 'win-bru',  name: 'Bulk Rename Utility',  store: 'microsoft',   category: 'Utilities',    rating: 4.6, ratings_count: 8200, price: '$0 (donationware)' },
  { id: 'win-aren', name: 'Advanced Renamer',     store: 'microsoft',   category: 'Utilities',    rating: 4.5, ratings_count: 6100, price: '$0 / Pro $24' },
  { id: 'mac-namc', name: 'NameChanger',          store: 'apple_mac',   category: 'Utilities',    rating: 3.8, ratings_count: 420,  price: 'Free' },
  { id: 'ios-clipx',name: 'ClipSync Keyboard',    store: 'apple_ios',   category: 'Productivity', rating: 4.7, ratings_count: 15400,price: 'Free / Pro $2.99/mo' },
  { id: 'and-clipx',name: 'ClipSync',             store: 'google_play', category: 'Productivity', rating: 4.5, ratings_count: 22100,price: 'Free / Pro $2.49/mo' },
  { id: 'mac-clipb',name: 'ClipBoard Mini',       store: 'apple_mac',   category: 'Productivity', rating: 3.6, ratings_count: 310,  price: '$4.99' },
];

// The ranked opportunities the reviewer can score / dossier / analyze.
const OPPS = {
  'batch-file-renamer': {
    id: 'batch-file-renamer',
    title: 'Native Mac batch file renamer',
    source_platform: 'microsoft', target_platform: 'apple_mac', category: 'Utilities',
    demand: 91, gap: 94, review_pain: 82, portability: 88, monetization: 76, build_speed: 88,
    opportunity_score: 87,
    evidence: [
      '4 Windows batch-renamer apps with strong ratings (~19,200 combined recent ratings)',
      'Only weak Mac competition (NameChanger, 3.8 stars, 420 ratings)',
      'Reviews repeatedly ask for rules/regex, batch export, and folder monitoring',
    ],
    review_app: 'mac-namc',
    reviews: [
      { complaint: 'No batch/preset rename rules (regex)', mentions: 184, recent_mentions: 46, severity: 0.82, willingness_to_pay: 0.68, recommended_feature: 'Saved rename rules with regex + preview' },
      { complaint: 'Crashes on large folders', mentions: 97, recent_mentions: 31, severity: 0.74, willingness_to_pay: 0.55, recommended_feature: 'Streamed processing + progress for 10k+ files' },
      { complaint: 'No automation / watch folder', mentions: 61, recent_mentions: 20, severity: 0.61, willingness_to_pay: 0.6, recommended_feature: 'Folder monitoring + Shortcuts/MCP triggers' },
    ],
    differentiation: ['native menu-bar access', 'AI rename rules', 'folder monitoring', 'Shortcuts + MCP support', 'local-first privacy'],
    mvp_features: ['drag-drop batch rename', 'regex + token rules with live preview', 'undo', 'presets'],
    later_features: ['watch-folder automation', 'MCP tools for ChatGPT/Claude', 'iCloud rule sync'],
    pricing: { model: 'freemium_one_time_pro', suggested_price: 9.99 },
    build: { estimated_days: 4, framework: 'SwiftUI', permissions: ['Files & Folders'], policy_risks: [] },
    decision: 'approve',
  },
  'clipboard-cloud-sync': {
    id: 'clipboard-cloud-sync',
    title: 'Mac clipboard manager with reliable cloud sync',
    source_platform: 'google_play', target_platform: 'apple_mac', category: 'Productivity',
    demand: 84, gap: 71, review_pain: 79, portability: 72, monetization: 80, build_speed: 70,
    opportunity_score: 78,
    evidence: [
      'Mobile clipboard-sync apps are highly rated (iOS 4.7 stars/15k, Android 4.5 stars/22k)',
      'Mac clipboard tools exist but reviews complain sync is unreliable or absent',
      'Clear willingness to pay (existing $2-3/mo subscriptions)',
    ],
    review_app: 'mac-clipb',
    reviews: [
      { complaint: 'Sync drops / does not reach the Mac', mentions: 142, recent_mentions: 58, severity: 0.8, willingness_to_pay: 0.72, recommended_feature: 'End-to-end encrypted cross-device sync with conflict handling' },
      { complaint: 'No search over history', mentions: 88, recent_mentions: 25, severity: 0.6, willingness_to_pay: 0.5, recommended_feature: 'Full-text + type-filtered clipboard search' },
    ],
    differentiation: ['reliable E2E-encrypted sync', 'searchable history', 'menu-bar + hotkeys', 'MCP access', 'privacy-first'],
    mvp_features: ['clipboard history', 'search', 'pinned snippets', 'hotkey paste'],
    later_features: ['E2E cross-device sync', 'MCP clipboard.search_history tool'],
    pricing: { model: 'freemium_subscription', suggested_price: 3.99 },
    build: { estimated_days: 7, framework: 'SwiftUI', permissions: [], policy_risks: ['clipboard privacy disclosure'] },
    decision: 'approve',
  },
};

const norm = (s) => String(s || '').trim().toLowerCase();
const appView = (a) => ({ id: a.id, name: a.name, store: a.store, category: a.category, rating: a.rating, ratings_count: a.ratings_count, price: a.price });

function findOpp(ref) {
  const r = norm(ref);
  return OPPS[r] || Object.values(OPPS).find((o) => norm(o.id) === r || (r && norm(o.title).includes(r)));
}

// eslint-disable-next-line no-unused-vars — userId kept for signature parity
export async function demoExec(userId, tool, args = {}) {
  switch (tool) {
    case 'search_store_apps': {
      const q = norm(args.query);
      const stores = args.stores ? String(args.stores).split(',').map(norm) : null;
      const hits = APPS.filter((a) => (!q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)) && (!stores || stores.includes(a.store)));
      return { query: args.query || '', count: hits.length, results: hits.map(appView) };
    }
    case 'compare_platform_availability': {
      const q = norm(args.query || args.app);
      const stores = ['apple_ios', 'apple_mac', 'google_play', 'microsoft'];
      const matching = APPS.filter((a) => !q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
      const platforms = {};
      for (const s of stores) {
        const on = matching.filter((a) => a.store === s).sort((a, b) => b.ratings_count - a.ratings_count)[0];
        platforms[s] = on ? { present: true, best_app: on.name, rating: on.rating, ratings_count: on.ratings_count } : { present: false };
      }
      return { product: args.query || args.app || '', platforms, note: 'Absent or weak target platforms are the highest-value gaps.' };
    }
    case 'find_platform_gaps': {
      const map = { windows: 'microsoft', mac: 'apple_mac', macos: 'apple_mac', ios: 'apple_ios', android: 'google_play' };
      const src = args.sourcePlatform ? (map[norm(args.sourcePlatform)] || norm(args.sourcePlatform)) : null;
      const tgt = args.targetPlatform ? (map[norm(args.targetPlatform)] || norm(args.targetPlatform)) : null;
      const cat = args.category ? norm(args.category) : null;
      const minDemand = Number(args.minimumDemandScore || 0);
      const gaps = Object.values(OPPS)
        .filter((o) => (!src || o.source_platform === src) && (!tgt || o.target_platform === tgt) && (!cat || norm(o.category) === cat) && o.demand >= minDemand)
        .sort((a, b) => b.opportunity_score - a.opportunity_score)
        .map((o) => ({ id: o.id, opportunity: o.title, source_platform: o.source_platform, target_platform: o.target_platform, category: o.category, demand: o.demand, gap: o.gap, opportunity_score: o.opportunity_score, evidence: o.evidence }));
      return { count: gaps.length, gaps };
    }
    case 'analyze_app_reviews': {
      const byApp = APPS.find((a) => norm(a.id) === norm(args.appId || args.app));
      const opp = Object.values(OPPS).find((o) => byApp && o.review_app === byApp.id) || findOpp(args.opportunityId || args.appId || args.app);
      if (!opp) throw new Error(`No review data for: ${args.appId || args.app || ''}`);
      const app = APPS.find((a) => a.id === opp.review_app);
      return { app: app ? app.name : opp.title, review_count_analyzed: 500, clusters: opp.reviews };
    }
    case 'score_app_opportunity': {
      const o = findOpp(args.opportunityId || args.opportunity || args.id);
      if (!o) throw new Error(`Opportunity not found: ${args.opportunityId || args.opportunity || ''}`);
      return {
        opportunity: o.title,
        opportunity_score: o.opportunity_score,
        breakdown: { proven_demand: o.demand, target_gap: o.gap, review_pain: o.review_pain, portability: o.portability, monetization: o.monetization, build_speed: o.build_speed },
        decision: o.decision,
        note: 'Score = 25% demand + 25% gap + 15% review pain + 15% portability + 10% monetization + 10% build speed - risk penalties.',
      };
    }
    case 'generate_build_dossier': {
      const o = findOpp(args.opportunityId || args.opportunity || args.id);
      if (!o) throw new Error(`Opportunity not found: ${args.opportunityId || args.opportunity || ''}`);
      return {
        dossier: {
          concept: o.title,
          source_evidence: { source_store: o.source_platform, review_clusters: o.reviews.map((r) => r.complaint) },
          target_gap: { target_store: o.target_platform, gap_confidence: +(o.gap / 100).toFixed(2) },
          differentiation: o.differentiation,
          mvp_features: o.mvp_features,
          later_features: o.later_features,
          pricing: o.pricing,
          build: o.build,
          opportunity_score: o.opportunity_score,
          decision: o.decision,
        },
        note: 'Original, differentiated build plan (workflow-clone, not carbon-copy). Ready to hand to Codex or export to AppFleet.',
      };
    }
    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}
