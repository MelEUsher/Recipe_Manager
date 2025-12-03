# Contributing Guidelines

Thanks for helping improve Recipe Manager. Keep changes small, tested, and documented so the tutorial remains consistent.

## Workflow
- Branch from `main` (e.g., `feature/<short-name>` or `fix/<short-name>`).
- Follow the setup steps in `SETUP.md`; run the stack with `make dev` while developing.
- Keep docs in sync with behavior (README, ARCHITECTURE.md, SETUP.md) when you change flows or commands.

## Expectations before opening a PR
- Run checks in containers:
  - `make test-backend`
  - `make test-frontend`
  - `make test`
  - `make lint`
- Add or update tests when behavior changes.
- Avoid new dependencies unless necessary; keep existing patterns in `backend/` (FastAPI, SQLAlchemy) and `frontend/` (Next.js, fetch-based API helpers).
- Use clear commit messages (no strict convention required) and describe what changed in the PR body.

## Submitting changes
1. Push your branch and open a PR.
2. Include a short summary of what changed, how to test, and any screenshots for UI updates.
3. Address review feedback promptly; re-run `make test` and `make lint` after fixes.

## Code style reminders
- Prefer small, focused modules and keep naming consistent with existing files.
- For backend routers and CRUD, reuse the established Pydantic schemas; avoid duplicating validation.
- For frontend API calls, go through `frontend/lib/api.ts` so error handling stays consistent.
- Keep environment variables limited to those in `.env.example`.
