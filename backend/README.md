# Recipe Manager Backend

FastAPI backend for the Recipe Manager application.

## Setup

### Virtual Environment (Local Development)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

## Running

### Local Development

```bash
# Make sure virtual environment is activated
uvicorn main:app --reload --port 8000
```

### With Docker

```bash
# From project root
docker-compose up backend
```

## API Documentation

Once the server is running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
pytest -v
```

## Code Quality

```bash
# Format code
black .

# Lint code
flake8 .
```
