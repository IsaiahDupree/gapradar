// demandradar.js — the real-data backend client for GapRadar.
//
// GapRadar is a thin, well-annotated MCP surface over the DemandRadar Store
// Opportunity Engine (github.com/IsaiahDupree/google-demand-radar). Each MCP tool
// forwards to a DemandRadar HTTP endpoint; DemandRadar owns the store-data
// adapters (Google Play via RapidAPI, Apple RSS + iTunes Search, Microsoft
// Store), caching, review mining, cross-store matching, and scoring.
//
// Configuration (env):
//   DEMANDRADAR_URL      base URL of the DemandRadar API (e.g. https://demandradar.app)
//   DEMANDRADAR_API_KEY  bearer/key DemandRadar issues for this connector
//
// If those are unset, the connector is NOT wired to live data. Rather than
// invent numbers, every tool then returns a clear, honest "not configured"
// error. Reviewers use the demo account (server-side sample opportunities); a
// self-hoster sets the two env vars to light up real data.

const BASE = (process.env.DEMANDRADAR_URL || '').replace(/\/+$/, '');
const KEY = process.env.DEMANDRADAR_API_KEY || '';

export const demandradarConfigured = !!(BASE && KEY);

const TIMEOUT_MS = 25_000;

// Map each MCP tool to a DemandRadar request. Paths follow the DemandRadar
// Store-Intelligence API contract (see PRD 03-gapradar-demandradar.md). Read-only
// tools use GET; the scoring/dossier tools POST the opportunity payload.
const ROUTES = {
  search_store_apps:            { method: 'GET',  path: '/api/store/search' },
  compare_platform_availability:{ method: 'GET',  path: '/api/store/compare' },
  find_platform_gaps:           { method: 'GET',  path: '/api/gaps' },
  analyze_app_reviews:          { method: 'GET',  path: '/api/reviews/analyze' },
  score_app_opportunity:        { method: 'POST', path: '/api/opportunities/score' },
  generate_build_dossier:       { method: 'POST', path: '/api/opportunities/dossier' },
};

function qs(args = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(args)) {
    if (v == null) continue;
    p.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

export async function demandradarExec(userId, tool, args = {}) {
  const route = ROUTES[tool];
  if (!route) throw new Error(`Unknown tool: ${tool}`);
  if (!demandradarConfigured) {
    throw new Error(
      'GapRadar is not connected to a live store-data source on this deployment. ' +
      'Reviewers: sign in with the demo account to explore sample opportunities. ' +
      'Self-hosters: set DEMANDRADAR_URL and DEMANDRADAR_API_KEY (the DemandRadar backend) to enable live data.'
    );
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const isGet = route.method === 'GET';
    const url = BASE + route.path + (isGet ? qs({ ...args, requester: userId }) : '');
    const res = await fetch(url, {
      method: route.method,
      headers: {
        authorization: `Bearer ${KEY}`,
        'x-gapradar-user': userId,
        ...(isGet ? {} : { 'content-type': 'application/json' }),
      },
      body: isGet ? undefined : JSON.stringify(args),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`DemandRadar ${route.path} failed (HTTP ${res.status})${body ? `: ${body.slice(0, 200)}` : ''}`);
    }
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('DemandRadar timed out');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
