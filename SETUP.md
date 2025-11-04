# Setup Guide

This guide will help you set up the Recipe Manager application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10 or higher) and **Docker Compose** (v2.0 or higher)
- **Node.js** (v18 or higher) and **npm**
- **Python** (v3.11 or higher) and **pip**
- **Make** (usually pre-installed on macOS/Linux)
- **Git** for version control

## Quick Start

If you just want to get up and running quickly:

```bash
# Clone the repository
git clone <repository-url>
cd ai-dev-session-1

# Initial setup
make setup

# Install dependencies
make install

# Start all services with Docker
make dev
```

That's it! The application should now be running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Detailed Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-dev-session-1
```

### 2. Environment Configuration

Create environment variables file:

```bash
cp .env.example .env
```

Edit `.env` if you need to change any default values:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recipe_db
DB_USER=recipe_user
DB_PASSWORD=recipe_password

# Application Environment
ENVIRONMENT=development
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Backend Setup

#### Option A: Using Docker (Recommended)

Docker will handle everything automatically when you run `make dev`.

#### Option B: Local Development

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Make sure PostgreSQL is running (via Docker or locally)
# Then run migrations
alembic upgrade head

# Start the development server
uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup

#### Option A: Using Docker (Recommended)

Docker will handle everything automatically when you run `make dev`.

#### Option B: Local Development

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:3000.

### 5. Database Setup

#### Option A: Using Docker (Recommended)

The database will start automatically with `docker-compose up`.

#### Option B: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create the database
createdb recipe_db

# Create user (if needed)
psql -c "CREATE USER recipe_user WITH PASSWORD 'recipe_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE recipe_db TO recipe_user;"

# Run migrations
cd backend
alembic upgrade head
```

### 6. Running Migrations

Migrations are handled by Alembic. To run migrations:

```bash
# Using Make
make migrate

# Or manually
cd backend
alembic upgrade head
```

To create a new migration after model changes:

```bash
make migrate-create
# Or manually:
cd backend
alembic revision --autogenerate -m "Description of changes"
```

## Verification

After setup, verify everything is working:

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status": "healthy", "service": "recipe-manager-api"}
```

### 2. Check API Documentation

Visit http://localhost:8000/docs to see the interactive API documentation.

### 3. Check Frontend

Open http://localhost:3000 in your browser. You should see the Recipe Manager home page.

### 4. Run Tests

```bash
# Backend tests
make test-backend

# Frontend tests
make test-frontend

# All tests
make test
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # Database

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Issues

If backend can't connect to the database:

1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs db
   ```

3. Verify environment variables in `.env`

### Docker Issues

If Docker containers aren't starting:

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Rebuild containers
docker-compose up --build
```

### Frontend Build Errors

If you encounter frontend build errors:

```bash
cd frontend
rm -rf node_modules .next
npm install
npm run build
```

### Backend Import Errors

If you get Python import errors:

```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

## Development Workflow

### Making Changes

1. **Frontend Changes**: Edit files in `frontend/`. Changes will hot-reload automatically.

2. **Backend Changes**: Edit files in `backend/`. The server will restart automatically.

3. **Database Changes**:
   - Modify models in `backend/models.py`
   - Create migration: `make migrate-create`
   - Apply migration: `make migrate`

### Running Tests

```bash
# Watch mode (automatic rerun on changes)
cd backend && pytest --watch
cd frontend && npm test

# Single run
make test
```

### Code Quality

```bash
# Format code
make format

# Lint code
make lint
```

## Production Deployment

For production deployment, you'll need to:

1. Set `ENVIRONMENT=production` in `.env`
2. Use a production-ready database (not SQLite)
3. Set strong passwords and secrets
4. Use a reverse proxy (nginx) for HTTPS
5. Enable CORS only for your production domain
6. Set up proper logging and monitoring

See your hosting provider's documentation for specific deployment instructions.

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

## Getting Help

If you encounter issues:

1. Check this setup guide
2. Review the troubleshooting section
3. Check the project's GitHub issues
4. Consult the official documentation for each technology
5. Ask for help in the project's discussion forum
