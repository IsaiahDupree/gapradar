# Owner account and persistent storage restoration — 2026-10-24

The deployed service now uses the shared ACTP Supabase project with isolated app tables and RPC functions. Service-role-only grants and RLS keep credentials, sessions, and app state separate from the other bridge apps. Production refuses missing persistent storage configuration; health returns HTTP 503 when required storage or signing configuration is unavailable. Database requests have a ten-second bound.

A real owner account was created and verified through sign-in and `/api/me`, with demo mode disabled. Its generated password is saved in the owner's encrypted credential vault; no password or bearer token is included in this repository. Email verification is automatic because outbound verification mail is not configured.

Validation: existing server unit tests passed (33 EtsyOps, 26 GapRadar); real Supabase temporary-key integration passed value round-trip, counter, FIFO queue, expiry and cleanup. The deployed relay reports version 1.4.0. The migration is checked in for review.

ChatGPT reconnection remains blocked in the installed app: Reconnect and Connect another account report that no browser setup URL is available. The installed settings show the correct MCP URL and OAuth support; independent authorization-server/protected-resource discovery and health calls return HTTP 200. Server logs show no OAuth registration from these attempts. This is distinct from the restored backend and owner-account validation. Provider acceptance remains pending. EtsyOps also reports its Etsy application key is unconfigured, so an authenticated real-shop read is not yet verified. No demo shop output is counted as owner data. No paid plan or research-credit purchase was made.
