# Architecture Overview

This document summarizes how the Recipe Manager runs locally and how its pieces fit together.

## System Overview
- Frontend: Next.js (TypeScript, App Router, Tailwind) renders the UI and issues API calls to the backend using `NEXT_PUBLIC_API_URL`.
- Backend: FastAPI exposes REST endpoints under `/api`, handles validation with Pydantic schemas, and uses SQLAlchemy + Alembic for data access and migrations.
- Database: PostgreSQL stores categories, recipes, and ingredients.
- Local orchestration: Docker Compose wires the services together; the Makefile wraps common tasks.

## Runtime Flow
1. A user interacts with the Next.js UI (list, view, create, or edit recipe flows).
2. The frontend calls the FastAPI backend (e.g., `/api/recipes` and `/api/categories`) using the configured API base URL.
3. FastAPI routers validate input, run CRUD logic, and read/write through SQLAlchemy sessions.
4. PostgreSQL persists data; responses are returned as JSON to the frontend to update the UI.

## Containers and Networking
- `db` (PostgreSQL 15): Runs on port `5432` (mapped to `${DB_PORT:-5432}`); configured via `DB_NAME`, `DB_USER`, and `DB_PASSWORD` from `.env`; stores data on the `postgres_data` volume.
- `backend` (FastAPI): Exposes port `8000`; depends on `db`; uses `DATABASE_URL` for the SQLAlchemy connection; health check at `/health`.
- `frontend` (Next.js): Exposes port `3000`; depends on `backend`; uses `NEXT_PUBLIC_API_URL` to reach the API.
- Docker Compose handles service discovery (`db`, `backend`, `frontend` hostnames) and shared environment from `.env`.

## Data Model Overview
- **Category** (`categories`): `id`, `name` (unique), `description`; one-to-many with recipes.
- **Recipe** (`recipes`): `id`, `title`, `description`, `instructions`, `prep_time`, `cook_time`, `servings`, optional `category_id`, timestamps; belongs to a category; one-to-many with ingredients.
- **Ingredient** (`ingredients`): `id`, `recipe_id` (cascade delete), `name`, optional `amount`, optional `unit`; belongs to a recipe.

## Code Structure
- `backend/app/main.py` – FastAPI app creation, CORS, router registration, health endpoint.
- `backend/app/api/routers/` – Route handlers (`recipes.py`, `categories.py`).
- `backend/app/crud/` – Database operations used by routers.
- `backend/app/models/` – SQLAlchemy models for categories, recipes, ingredients.
- `backend/app/schemas/` – Pydantic schemas for request/response validation.
- `backend/app/database.py` and `app/config/settings.py` – Engine/session setup and environment loading.
- `frontend/app/` – Next.js entry (`layout.tsx`, `page.tsx`) plus recipe pages under `app/recipes/`.
- `frontend/components/` – UI building blocks (recipe form and list item components; navigation is defined in `layout.tsx`).
- `frontend/lib/` – API helpers.
- `alembic/` – Migration environment and versioned migration scripts.
- `backend/tests/`, `frontend/tests/` – Backend pytest suite and frontend Jest/RTL suite.

## Dev Workflow and Tooling
- Toolchains are managed by `mise` via `.mise.toml`; run `mise install` to align Node/Python versions.
- Use `make setup` to create `.env` and install dependencies, `make dev` to start Docker services, and `make migrate` to apply Alembic migrations.
- Quality commands run in containers: `make test-backend`, `make test-frontend`, `make test`, and `make lint`.
- `make logs`, `make shell-backend`, and `make shell-db` help with debugging and inspection while services are running.
