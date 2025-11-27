# Setup Guide

Step-by-step instructions for bringing up the Recipe Manager locally with Docker Compose and the Makefile.

## Prerequisites
- macOS or Linux with Docker + Docker Compose v2
- `make` and `git`
- `mise` for toolchain management (see `README-MISE.md` for installing/running `mise install`)

## 1) Clone and toolchain
```bash
git clone <repo-url>
cd Agentic-Programming-Intro
# Align Python/Node versions if you use mise
mise install
```

## 2) Environment
```bash
cp .env.example .env
```
Key values (adjust as needed):
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` – Postgres settings passed to the `db` container.
- `DATABASE_URL` – SQLAlchemy URL the backend uses (defaults to the `db` service host).
- `NEXT_PUBLIC_API_URL` – Base URL the frontend uses to call the backend (default `http://localhost:8000`).

## 3) Install and start
```bash
# Ensure .env exists and install backend/frontend deps locally
make setup

# Start backend, frontend, and db containers
make dev

# Apply migrations inside the backend container (run after services are up)
make migrate
```

Access the running stack:
- Frontend: http://localhost:3000
- Backend API/docs: http://localhost:8000/docs (Swagger) and http://localhost:8000/redoc

## 4) Tests and quality
```bash
make test-backend     # pytest in backend container
make test-frontend    # Jest/RTL in frontend container
make test             # both suites
make lint             # backend flake8 + frontend lint
```

## 5) Useful lifecycle commands
- `make stop` – Stop containers (keep volumes).
- `make clean` – Stop and remove containers + volumes.
- `make logs` – Tail logs from all services.
- `make shell-backend` / `make shell-db` – Open shells inside running containers.

If you change `.env`, restart services (`make stop` then `make dev`) so containers pick up updates.
