# Recipe Manager

A tutorial-sized Recipe Manager built through a series of prompts that combine a Next.js frontend, a FastAPI backend, and a PostgreSQL database. The project runs locally with Docker Compose and uses a Makefile to keep common tasks consistent.

## Tech Stack
- Frontend: Next.js (App Router) with TypeScript and Tailwind CSS
- Backend: FastAPI with SQLAlchemy and Alembic
- Database: PostgreSQL
- Tooling: Docker Compose, Makefile, mise, pytest, Jest + React Testing Library

## Getting Started (Local Development)
Prerequisites: Docker (with Compose v2), make, and `mise` for managing Node/Python versions (see `README-MISE.md` for details).

```bash
# Install toolchain from .mise.toml
mise install

# Create .env from example and install backend/frontend deps locally
make setup

# Start services (frontend, backend, db)
make dev

# Apply database migrations once containers are running
make migrate
```

Access the app:
- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

To stop or clean up: `make stop` (keeps volumes) or `make clean` (removes containers and volumes). If you already have a `.env`, you can reinstall dependencies with `make install`. `make reset` combines a clean and setup in one step.

## Environment Variables
`.env.example` is the source of truth. Copy it to `.env` and adjust as needed (do not commit real secrets).

- `DB_HOST` – Database host (`localhost` outside Docker, `db` inside Compose networks); example: `localhost`
- `DB_PORT` – Database port; example: `5432`
- `DB_NAME` – Database name; example: `recipe_db`
- `DB_USER` – Database user; example: `recipe_user`
- `DB_PASSWORD` – Database password; example: `recipe_password`
- `DATABASE_URL` – SQLAlchemy connection string used by the backend and Alembic; example: `postgresql+psycopg://recipe_user:recipe_password@db:5432/recipe_db`
- `ENVIRONMENT` – Application environment flag; example: `development`
- `NODE_ENV` – Node environment flag for Next.js; example: `development`
- `NEXT_PUBLIC_API_URL` – Base URL the frontend calls for API requests; example: `http://localhost:8000`

## Running with Docker / Makefile
- `make dev` starts frontend (port 3000), backend (port 8000), and PostgreSQL (port 5432) via Docker Compose.
- `make migrate` runs Alembic migrations inside the backend container.
- `make logs` tails all service logs; `make shell-backend` and `make shell-db` open shells in the respective containers.
- `make stop` stops services; `make clean` removes containers and volumes.

## Testing and Linting
- `make test-backend` – Run backend pytest suite.
- `make test-frontend` – Run frontend Jest tests.
- `make test` – Run both suites.
- `make lint` – Run backend flake8 and frontend lint tasks.

## Folder Structure
- `backend/` – FastAPI app (`app/main.py`, `api/routers`, `crud`, `models`, `schemas`, `database.py`, tests)
- `frontend/` – Next.js App Router app (`app/`, `components/`, `lib/`, tests)
- `alembic/` – Database migration setup
- `docker-compose.yml` – Service orchestration
- `Makefile` – Common tasks for local dev and CI
- `ARCHITECTURE.md` – System and runtime overview
- `.env.example` – Environment variable template
- `SETUP.md`, `README-MISE.md` – Additional setup notes

## API Overview
- `GET /health` – Simple service check; returns `{"status": "ok"}`.
- `GET /api/categories` – List categories.
- `POST /api/categories` – Create a category (`name` required, optional `description`); errors if the name already exists.
- `GET /api/recipes` – List recipes (optional `category_id` query filters by category).
- `POST /api/recipes` – Create a recipe with `title` plus optional fields (`description`, `instructions`, `prep_time`, `cook_time`, `servings`, `category_id`) and an `ingredients` array (`name`, optional `amount`, `unit`).
- `GET /api/recipes/{recipe_id}` – Fetch a recipe with its category and ingredients.
- `PUT /api/recipes/{recipe_id}` – Update a recipe; any provided field replaces the existing value. Supplying `ingredients` replaces the full ingredient list.
- `DELETE /api/recipes/{recipe_id}` – Delete a recipe (its ingredients are cascade-deleted).

Interactive docs are available at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc` when the backend is running.

## Tutorial Context
This repository reflects the completed outputs of tutorial prompts 1–9 for the Recipe Manager project: initializing the stack, wiring Docker Compose, adding tests, and finalizing documentation.
