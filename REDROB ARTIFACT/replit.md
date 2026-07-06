# REDROB ARTIFACT

Verifies a developer's self-reported skills against their real GitHub activity, producing a credibility score with human-readable evidence.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/redrob-artifact run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `GEMINI_API_KEY` — used directly with the `@google/genai` SDK (no Replit AI Integrations)
- No database is used — GitHub profile lookups are cached in-memory (5 min TTL) in the API server process.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Frontend: React + Vite (`artifacts/redrob-artifact`)
- Validation: Zod (`zod/v4`)
- API codegen: Orval (from OpenAPI spec)
- AI: Google Gemini via `@google/genai`, called directly with a user-provided `GEMINI_API_KEY`
- GitHub data: unauthenticated calls to the public GitHub REST API

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the `/verify` contract (`VerificationInput`, `VerificationResult`, `VerificationError`)
- `artifacts/api-server/src/routes/verify.ts` — the `/verify` route, orchestrates the pipeline below
- `artifacts/api-server/src/lib/agents/` — pipeline stages: `parsingAgent` (Gemini skill extraction), `githubAgent` (GitHub fetch + cache), `verificationAgent` (verdict computation + Gemini evidence summary), `scoringAgent` (score math)
- `artifacts/api-server/src/lib/gemini.ts` — Gemini client setup
- `artifacts/redrob-artifact/src/pages/home.tsx` — single-page intake/running/result UI

## Architecture decisions

- No DB/Drizzle: this app has no persistence requirements beyond a short-lived in-memory GitHub profile cache.
- Gemini is called directly with `@google/genai` and a user-supplied `GEMINI_API_KEY` secret, not through Replit AI Integrations (user declined the account upgrade needed for that path).
- GitHub API is called unauthenticated (public rate limits are acceptable for this use case).
- Verdict logic: a skill is `verified` if it matches 2+ repos with recent activity (pushed within 2 years, size > 0), `partial` if it matches exactly 1 repo, otherwise `unverified`. Score = round((verified*100 + partial*50) / (total*100) * 100), capped at 100.

## Product

- User pastes a GitHub username/URL and resume/skills text.
- Backend extracts skills via Gemini, fetches the GitHub profile/repos, cross-checks each skill against repo languages/names and activity recency, and asks Gemini to write a short evidence paragraph.
- Frontend shows a dark, hacker-terminal-styled scan animation, then a results screen with the score, per-skill verdict matrix, evidence text, and GitHub summary (top languages, most active repo, repo count).

## User preferences

- No emojis anywhere in the UI.
- Dark, atmospheric hacker-terminal visual style.

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `lib/api-spec/openapi.yaml` before touching client/server code that depends on the generated types.
- `GEMINI_API_KEY` must be set as a plain env secret; the app does not use the AI Integrations proxy.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
