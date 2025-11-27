# Architecture Overview

This document summarizes how the Recipe Manager runs locally and how its pieces fit together.

## System Overview
- Frontend (Next.js, TypeScript, Tailwind): Renders the UI and calls the backend using the `NEXT_PUBLIC_API_URL` base.
- Backend (FastAPI, SQLAlchemy): Serves REST endpoints under `/api`, validates payloads with Pydantic schemas, and persists data via SQLAlchemy.
- Database (PostgreSQL): Stores categories, recipes, and ingredients.
- Tooling: Docker Compose connects the services; the Makefile provides repeatable commands; `mise` pins Python/Node versions from `.mise.toml`.

## Runtime Flow
1. A user interacts with the Next.js UI (list, view, create, or edit recipe flows).
2. The frontend issues fetch requests to the FastAPI backend (e.g., `/api/recipes`, `/api/categories`) via `NEXT_PUBLIC_API_URL`.
3. FastAPI routers validate payloads, run CRUD helpers, and use SQLAlchemy sessions to read/write rows.
4. PostgreSQL persists the data; JSON responses flow back to the frontend to update the UI.

## Containers and Networking
- `db` (PostgreSQL 15): Exposes `${DB_PORT:-5432}` externally; configured via `DB_NAME`, `DB_USER`, `DB_PASSWORD` from `.env`; data stored on the `postgres_data` volume.
- `backend` (FastAPI): Exposes `8000`; depends on `db`; uses `DATABASE_URL` for SQLAlchemy; health check at `/health`.
- `frontend` (Next.js): Exposes `3000`; depends on `backend`; uses `NEXT_PUBLIC_API_URL` to reach the API.
- Docker Compose shares environment from `.env` and provides service hostnames (`db`, `backend`, `frontend`) for inter-container networking.

## Database Schema
```
[categories]
- id (PK)
- name (unique, indexed)
- description

1 ───< relationship: categories.id -> recipes.category_id (nullable, ON DELETE SET NULL)

[recipes]
- id (PK)
- title (indexed)
- description
- instructions
- prep_time
- cook_time
- servings
- category_id (FK to categories.id)
- created_at
- updated_at

1 ───< relationship: recipes.id -> ingredients.recipe_id (ON DELETE CASCADE)

[ingredients]
- id (PK)
- recipe_id (FK)
- name
- amount
- unit
```

## API Surface (from backend routers)
- `GET /health` – Service check; returns `{"status": "ok"}`.
- `GET /api/categories` – List categories.
- `POST /api/categories` – Create a category (`name`, optional `description`); rejects duplicate names.
- `GET /api/recipes` – List recipes; optional `category_id` query filters by category.
- `POST /api/recipes` – Create a recipe with optional metadata and an `ingredients` array.
- `GET /api/recipes/{recipe_id}` – Retrieve a recipe with category and ingredients.
- `PUT /api/recipes/{recipe_id}` – Update a recipe; provided fields (including `ingredients`) replace existing values.
- `DELETE /api/recipes/{recipe_id}` – Delete a recipe and its ingredients.

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
- `alembic/` – Migration environment scaffolding.
- `backend/tests/`, `frontend/tests/` – Backend pytest suite and frontend Jest/RTL suite.

## Dev Workflow and Tooling
- Run `mise install` (see `README-MISE.md`) to align Python/Node versions locally.
- `make setup` ensures `.env` exists and installs backend/frontend dependencies; `make dev` starts the Docker stack; `make migrate` applies Alembic migrations inside the backend container.
- Quality commands run in containers: `make test-backend`, `make test-frontend`, `make test`, `make lint`.
- Use `make logs`, `make shell-backend`, and `make shell-db` to inspect running services.
