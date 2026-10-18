// mcpTools.js — the MCP server GapRadar exposes to ChatGPT / Claude / Codex.
// GapRadar is a market-intelligence + product-decision surface over the
// DemandRadar Store Opportunity Engine: it compares app stores, finds
// underserved platform gaps, mines review complaints, scores opportunities, and
// produces evidence-backed build dossiers. This is where monetization lives:
// free accounts get a small monthly allowance of quick checks; paid plans unlock
// cross-platform gap detection, review mining, and unlimited build dossiers.
//
// Real accounts forward to DemandRadar (server/lib/demandradar.js); the reviewer
// demo account is served sample opportunities from demoStore.js. All V1 tools are
// read-only research — no writes, no money movement.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { demandradarExec } from './demandradar.js';
import { demoExec } from './demoStore.js';
import { redis } from './redis.js';
import { getPlan, billingEnabled } from './billing.js';

const asText = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] });
const asError = (err) => ({ isError: true, content: [{ type: 'text', text: `Error: ${err.message || String(err)}` }] });

// Every GapRadar tool only reads/derives market data — never writes, never
// reaches a user's private account. openWorldHint is true because the underlying
// data comes from external app stores (an open, changing world).
const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };

const UPGRADE_URL = `${(process.env.PUBLIC_BASE_URL || 'https://getgapradar.vercel.app').replace(/\/+$/, '')}/upgrade`;
const FREE_MONTHLY = Number(process.env.FREE_MONTHLY_CHECKS || 5);
// Deep, cost-heavy tools are Pro-only; quick lookups are metered on the free tier.
const PRO_ONLY = new Set(['find_platform_gaps', 'analyze_app_reviews', 'generate_build_dossier']);
const CAPPED = new Set(['search_store_apps', 'compare_platform_availability', 'score_app_opportunity']);

const month = () => new Date().toISOString().slice(0, 7).replace('-', ''); // yyyymm
async function bumpMonthly(userId) {
  const key = `usage:${userId}:${month()}`;
  const n = await redis.incr(key);
  await redis.expire(key, 3456000); // 40 days
  return n;
}

export function buildServer(userId, { demo = false } = {}) {
  const server = new McpServer({ name: 'gapradar', version: '1.0.0' });

  // Demo accounts are treated as Pro so reviewers can exercise every tool
  // against the sample opportunities. Real accounts get their plan from Stripe.
  const planIsPro = async () => (demo ? true : billingEnabled ? (await getPlan(userId)) === 'pro' : true);
  const exec = demo ? (tool, args) => demoExec(userId, tool, args) : (tool, args) => demandradarExec(userId, tool, args);

  const forward = (tool) => async (args) => {
    try {
      const pro = await planIsPro();
      if (PRO_ONLY.has(tool) && !pro) {
        return asText({
          upgrade_required: true,
          message: `${tool} is a paid feature. Upgrade (Builder $29/mo) to unlock cross-platform gap detection, review mining, and unlimited build dossiers.`,
          upgrade_url: UPGRADE_URL,
        });
      }
      if (CAPPED.has(tool) && !pro) {
        const n = await bumpMonthly(userId);
        if (n > FREE_MONTHLY) {
          return asText({
            upgrade_required: true,
            message: `You've used your ${FREE_MONTHLY} free opportunity checks this month. Upgrade (Builder $29/mo) for 40 deep scans, or Pro ($79/mo) for 200.`,
            upgrade_url: UPGRADE_URL,
          });
        }
      }
      return asText(await exec(tool, args ?? {}));
    } catch (e) {
      return asError(e);
    }
  };

  server.registerTool(
    'search_store_apps',
    {
      title: 'Search app stores',
      description: 'Search apps across Apple App Store, Google Play, and the Microsoft Store. Returns matching apps with store, category, rating, rating count, and price — the raw signal for demand and competition.',
      inputSchema: {
        query: z.string(),
        stores: z.string().optional().describe('Comma-separated: apple_ios,apple_mac,google_play,microsoft'),
        country: z.string().optional(),
        category: z.string().optional(),
        minimumRatingCount: z.number().int().optional(),
      },
      annotations: RO,
    },
    forward('search_store_apps')
  );

  server.registerTool(
    'compare_platform_availability',
    {
      title: 'Compare platform availability',
      description: "For a product or app name, show where it exists across Apple iOS, Apple Mac, Google Play, and Microsoft Store — and where it is absent or weak. Absent/weak target platforms are the highest-value gaps.",
      inputSchema: { query: z.string() },
      annotations: RO,
    },
    forward('compare_platform_availability')
  );

  server.registerTool(
    'find_platform_gaps',
    {
      title: 'Find platform gaps (Pro)',
      description: 'Paid. Find proven app workflows on one platform that are underserved or missing on another (e.g. strong on Windows, weak on Mac). Returns ranked opportunities with demand, gap, and an opportunity score, plus the evidence behind each.',
      inputSchema: {
        sourcePlatform: z.string().optional().describe('windows | mac | ios | android'),
        targetPlatform: z.string().optional().describe('windows | mac | ios | android'),
        category: z.string().optional(),
        minimumDemandScore: z.number().int().min(0).max(100).optional(),
      },
      annotations: RO,
    },
    forward('find_platform_gaps')
  );

  server.registerTool(
    'analyze_app_reviews',
    {
      title: 'Analyze app reviews (Pro)',
      description: 'Paid. Cluster an app\'s negative reviews and feature requests into recurring complaints, each with how often it is mentioned, its severity, willingness-to-pay signal, and a recommended feature to build. This is where the differentiation for a better product comes from.',
      inputSchema: { appId: z.string().optional(), app: z.string().optional(), opportunityId: z.string().optional() },
      annotations: RO,
    },
    forward('analyze_app_reviews')
  );

  server.registerTool(
    'score_app_opportunity',
    {
      title: 'Score an opportunity',
      description: 'Score an opportunity out of 100 with a transparent breakdown: proven demand, target-platform gap, review pain, portability, monetization, and build speed (minus risk penalties). Returns a build / no-build signal.',
      inputSchema: { opportunityId: z.string().optional(), opportunity: z.string().optional() },
      annotations: RO,
    },
    forward('score_app_opportunity')
  );

  server.registerTool(
    'generate_build_dossier',
    {
      title: 'Generate a build dossier (Pro)',
      description: 'Paid. Produce an evidence-backed, Codex-ready build plan for an opportunity: the concept, source evidence, target gap, original differentiation (workflow-clone, not carbon-copy), MVP and later features, suggested pricing, build estimate, and policy risks.',
      inputSchema: { opportunityId: z.string().optional(), opportunity: z.string().optional(), targetPlatform: z.string().optional(), framework: z.string().optional(), maximumBuildDays: z.number().int().optional() },
      annotations: RO,
    },
    forward('generate_build_dossier')
  );

  server.registerTool(
    'get_plan',
    {
      title: 'Check plan & upgrade',
      description: "Report the user's current plan (free or paid), what the paid plans unlock, the monthly free allowance, and the link to upgrade. Use this when a paid feature is requested on the free plan.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      const pro = await planIsPro();
      return asText({
        plan: pro ? 'paid' : 'free',
        billing_enabled: billingEnabled,
        paid_features: ['Cross-platform gap detection (find_platform_gaps)', 'Review complaint mining (analyze_app_reviews)', 'Unlimited build dossiers (generate_build_dossier)', 'Codex + AppFleet handoff'],
        free_allowance: `${FREE_MONTHLY} opportunity checks / month`,
        plans: { builder: '$29/mo — 40 deep scans', pro: '$79/mo — 200 scans, unlimited dossiers', studio: '$249/mo — 5 seats, 1000 scans, API' },
        upgrade_url: UPGRADE_URL,
        note: pro ? 'You are on a paid plan — everything is unlocked.' : `You're on the free plan (${FREE_MONTHLY} checks/month). Upgrade at ${UPGRADE_URL}.`,
      });
    }
  );

  return server;
}
