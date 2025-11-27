COMPOSE      = docker compose
BACKEND_DIR  = ./backend
FRONTEND_DIR = ./frontend

.PHONY: help check-versions setup install dev stop clean reset migrate test-backend test-frontend test lint logs shell-backend shell-db ensure-env

# Default: show available commands
help:
	@echo "Recipe Manager - Make Targets"
	@echo "================================"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make check-versions   - Show Python/Node versions in use"
	@echo "  make setup            - Ensure .env exists and install deps"
	@echo "  make install          - Install backend & frontend deps locally"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start all services with docker compose"
	@echo "  make stop             - Stop services (containers stay)"
	@echo "  make clean            - Stop and remove containers + volumes"
	@echo "  make reset            - Clean, then re-run setup"
	@echo ""
	@echo "Database:"
	@echo "  make migrate          - Run Alembic migrations in backend container"
	@echo "  make shell-db         - Open psql shell in db container"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test-backend     - Run backend tests in backend container"
	@echo "  make test-frontend    - Run frontend tests in frontend container"
	@echo "  make test             - Run both backend and frontend tests"
	@echo "  make lint             - Run backend and frontend linters"
	@echo ""
	@echo "Utilities:"
	@echo "  make logs             - Tail logs from all services"
	@echo "  make shell-backend    - Open bash shell in backend container"
	@echo ""

# Quick sanity check on runtimes (uses mise-managed python/node on your machine)
check-versions:
	@echo "Python: $$(python3 --version)"
	@echo "Node:   $$(node --version)"

# High-level setup: ensure env + install deps
setup: ensure-env install

# Install backend and frontend dependencies locally
install:
	@echo "Installing backend dependencies..."
	@cd $(BACKEND_DIR) && python3 -m pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	@cd $(FRONTEND_DIR) && npm install

# Start all services in the background
dev:
	$(COMPOSE) up -d

# Stop all running services without removing volumes
stop:
	$(COMPOSE) stop

# Remove containers and volumes
clean:
	$(COMPOSE) down -v

# Reset the project by cleaning and running setup again
reset: clean setup

# Apply database migrations with Alembic inside the backend container
migrate:
	$(COMPOSE) exec backend alembic upgrade head

# Run backend tests with pytest in backend container
test-backend:
	$(COMPOSE) exec backend pytest -v

# Run frontend tests with npm test (Jest) in frontend container
test-frontend:
	$(COMPOSE) exec frontend npm run test

# Run all tests
test: test-backend test-frontend

# Run linting for backend and frontend
lint:
	$(COMPOSE) exec backend flake8 app
	$(COMPOSE) exec frontend npm run lint

# Stream logs from all services
logs:
	$(COMPOSE) logs -f

# Open an interactive shell inside the backend container
shell-backend:
	$(COMPOSE) exec backend /bin/bash

# Open a psql shell connected to the project database
shell-db:
	$(COMPOSE) exec db bash -c 'export PGPASSWORD="$${POSTGRES_PASSWORD}"; psql -U "$${POSTGRES_USER}" -d "$${POSTGRES_DB}"'

# Helper target to create .env if it does not already exist
ensure-env:
	@if [ ! -f .env ]; then \
		cp .env.example .env && echo "Created .env from .env.example"; \
	else \
		echo ".env already exists; skipping copy."; \
	fi