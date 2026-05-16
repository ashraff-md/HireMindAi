# HireMind AI

Monorepo for **HireMind AI**, a voice-forward AI interview coach.

## Structure

- **[`frontend/`](frontend/)** — Next.js App Router UI (Tailwind v4, shadcn/ui, Framer Motion, dual theme). Proxies `/api/*` to the backend in development.
- **[`backend/`](backend/)** — Next.js API routes + services (OpenAI, ElevenLabs, Supabase admin, PayHere, resume PDF parsing).
- **[`supabase/`](supabase/)** — SQL migrations (shared infra).

## Prerequisites

- Node 20+
- npm (workspaces enabled at repo root)

## Environment

- **Backend secrets**: copy variables into [`backend/.env.local`](backend/.env.local) (`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, optional ElevenLabs/PayHERE keys — see existing repo `.env.example` if present).
- **Frontend public vars**: copy [`frontend/.env.example`](frontend/.env.example) → `frontend/.env.local`. Without Supabase keys you can still run guest/mock flows.
- **Voice mock asset**: optional file at `backend/public/mock-interviewer.mp3`; otherwise set `PUBLIC_APP_URL=http://127.0.0.1:3001` so mocked audio URLs resolve.

## Important: interview APIs + auth

`POST /api/interview/start` expects `userId` to match a Supabase Auth user (`public.users.id` FK). Guests use the polished **mock** pipeline on the frontend. Sign up / sign in to hit real inserts once Supabase + backend env are configured.

## Scripts

```bash
npm install        # installs all workspaces
npm run dev        # backend :3001 + frontend :3000 (concurrently)
npm run build      # backend then frontend production builds
npm run lint       # lint both packages
```

Open [http://localhost:3000](http://localhost:3000) for the UI; APIs run at [http://127.0.0.1:3001/api](http://127.0.0.1:3001/api).

## Learn More

- Product notes: [`docementation.md`](docementation.md)
- Next.js 16 conventions for this repo: [`AGENTS.md`](AGENTS.md)
