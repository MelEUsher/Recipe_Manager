COMPOSE = docker compose
BACKEND_DIR = ./backend
FRONTEND_DIR = ./frontend

.PHONY: setup install dev stop clean reset migrate test-backend test-frontend lint logs shell-backend shell-db ensure-env

# Create .env from the example file if missing, then install dependencies
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

# Run backend tests with pytest
test-backend:
	$(COMPOSE) exec backend pytest -v

# Run frontend tests with npm test (Jest)
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

# Helper target to create .env if it does not already existmake shell-db
ensure-env:
	@if [ ! -f .env ]; then \
		cp .env.example .env && echo "Created .env from .env.example"; \
	else \
		echo ".env already exists; skipping copy."; \
	fi
