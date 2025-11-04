# Architecture Overview

This document provides an overview of the Recipe Manager application architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │   Pages    │  │Components│  │   API Client (lib)   │   │
│  └────────────┘  └──────────┘  └──────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  Routers   │  │ Schemas  │  │      CRUD Logic      │   │
│  └────────────┘  └──────────┘  └──────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │            SQLAlchemy ORM & Models                  │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ SQL
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Database (PostgreSQL)                       │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ Categories │  │  Recipes │  │    Ingredients       │   │
│  └────────────┘  └──────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Native Fetch API
- **Testing**: Jest + React Testing Library

### Backend

- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Validation**: Pydantic
- **Testing**: pytest
- **Code Quality**: Black (formatter), Flake8 (linter)

### Database

- **Database**: PostgreSQL 15
- **Schema Management**: Alembic migrations

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Development Tools**: Make, Git

## Component Details

### Frontend Architecture

#### Directory Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with navbar
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── recipes/           # Recipe pages
│       ├── page.tsx       # List all recipes
│       ├── new/           # Create recipe
│       └── [id]/          # Dynamic recipe routes
│           ├── page.tsx   # View recipe
│           └── edit/      # Edit recipe
├── components/            # Reusable React components
│   ├── Navbar.tsx        # Navigation bar
│   ├── RecipeCard.tsx    # Recipe card component
│   └── RecipeForm.tsx    # Recipe form (create/edit)
├── lib/                   # Utilities and helpers
│   └── api.ts            # API client functions
└── __tests__/            # Test files
```

#### Key Patterns

- **Server Components**: Pages are server components by default for better performance
- **Client Components**: Interactive components use "use client" directive
- **API Client**: Centralized API communication in `lib/api.ts`
- **Type Safety**: TypeScript interfaces for all data structures

### Backend Architecture

#### Directory Structure

```
backend/
├── main.py               # FastAPI application entry point
├── database.py           # Database connection and session management
├── models.py             # SQLAlchemy ORM models
├── schemas.py            # Pydantic validation schemas
├── crud.py               # Database CRUD operations
├── routers.py            # API route handlers
├── alembic/              # Database migrations
│   ├── env.py           # Alembic environment
│   └── versions/        # Migration files
├── tests/                # Test files
│   └── test_api.py      # API endpoint tests
└── conftest.py           # Pytest configuration
```

#### Key Patterns

- **Dependency Injection**: FastAPI's dependency system for database sessions
- **Repository Pattern**: CRUD operations separated from route handlers
- **Schema Validation**: Pydantic models for request/response validation
- **ORM**: SQLAlchemy for database interactions
- **Migration Management**: Alembic for schema versioning

### Database Schema

```sql
-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Recipes Table
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    prep_time INTEGER,
    cook_time INTEGER,
    servings INTEGER,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Ingredients Table
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    amount NUMERIC,
    unit VARCHAR(50)
);
```

#### Relationships

- **One-to-Many**: Category → Recipes
- **One-to-Many**: Recipe → Ingredients
- **Cascade Delete**: Deleting a recipe deletes its ingredients

## API Design

### RESTful Endpoints

#### Recipes

- `GET /api/recipes` - List all recipes (with optional filtering)
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/{id}` - Get a specific recipe
- `PUT /api/recipes/{id}` - Update a recipe
- `DELETE /api/recipes/{id}` - Delete a recipe

#### Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/{id}` - Get a specific category
- `PUT /api/categories/{id}` - Update a category
- `DELETE /api/categories/{id}` - Delete a category

### Request/Response Format

All API requests and responses use JSON format.

#### Example: Create Recipe

**Request:**
```json
POST /api/recipes
{
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade cookies",
  "instructions": "Mix ingredients and bake at 350°F for 12 minutes",
  "prep_time": 15,
  "cook_time": 12,
  "servings": 24,
  "category_id": 1,
  "ingredients": [
    {"name": "flour", "amount": 2, "unit": "cups"},
    {"name": "sugar", "amount": 1, "unit": "cup"}
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade cookies",
  "instructions": "Mix ingredients and bake at 350°F for 12 minutes",
  "prep_time": 15,
  "cook_time": 12,
  "servings": 24,
  "category_id": 1,
  "category": {
    "id": 1,
    "name": "Desserts",
    "description": "Sweet treats"
  },
  "ingredients": [
    {"id": 1, "recipe_id": 1, "name": "flour", "amount": 2, "unit": "cups"},
    {"id": 2, "recipe_id": 1, "name": "sugar", "amount": 1, "unit": "cup"}
  ],
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": null
}
```

## Data Flow

### Creating a Recipe

1. User fills out form in `RecipeForm` component
2. Form submission calls `createRecipe()` from `lib/api.ts`
3. Fetch API sends POST request to `/api/recipes`
4. FastAPI router receives request, validates with Pydantic schema
5. CRUD function creates recipe and ingredients in database
6. Response returns created recipe with generated IDs
7. Frontend navigates to recipes list page
8. Recipes list fetches and displays all recipes

### Viewing a Recipe

1. User clicks on recipe card
2. Next.js navigates to `/recipes/[id]`
3. Page component calls `getRecipe(id)` from `lib/api.ts`
4. Fetch API sends GET request to `/api/recipes/{id}`
5. FastAPI router retrieves recipe with SQLAlchemy
6. Recipe includes related category and ingredients (eager loading)
7. Response sent back to frontend
8. Component renders recipe details

## Security Considerations

### Current Implementation

- **CORS**: Configured to allow requests from frontend domain
- **Input Validation**: Pydantic schemas validate all inputs
- **SQL Injection**: Prevented by SQLAlchemy ORM
- **Error Handling**: Generic error messages to avoid information leakage

### Production Recommendations

- Add authentication and authorization (JWT tokens)
- Enable HTTPS/TLS
- Implement rate limiting
- Add input sanitization for user-generated content
- Use environment variables for secrets
- Enable database connection pooling
- Add request logging and monitoring
- Implement CSRF protection
- Set up security headers (HSTS, CSP, etc.)

## Performance Considerations

### Current Optimizations

- **Database Indexes**: On frequently queried fields (id, name, title)
- **Eager Loading**: Related data loaded in single query
- **Connection Pooling**: SQLAlchemy manages database connections
- **Static Generation**: Next.js optimizes page rendering

### Future Improvements

- Add caching layer (Redis)
- Implement pagination for large result sets
- Add database query optimization
- Use CDN for static assets
- Implement lazy loading for images
- Add API response caching
- Use database read replicas for scaling

## Testing Strategy

### Backend Tests

- **Unit Tests**: CRUD operations
- **Integration Tests**: API endpoints with test database
- **Fixtures**: pytest fixtures for test data setup/teardown

### Frontend Tests

- **Component Tests**: Individual component rendering and behavior
- **Integration Tests**: User interactions and API mocking
- **Snapshot Tests**: Visual regression testing

## Deployment Architecture

### Development

```
Docker Compose on localhost
├── PostgreSQL container
├── FastAPI container (hot reload)
└── Next.js container (hot reload)
```

### Production (Recommended)

```
Load Balancer
├── Frontend (Vercel/Netlify)
├── Backend (AWS ECS/GCP Cloud Run)
└── Database (AWS RDS/GCP Cloud SQL)
```

## Scalability

### Current Limitations

- Single database instance
- No caching layer
- No horizontal scaling
- No load balancing

### Scaling Path

1. **Vertical Scaling**: Increase server resources
2. **Database Scaling**: Read replicas, connection pooling
3. **Horizontal Scaling**: Multiple backend instances behind load balancer
4. **Caching**: Redis for frequently accessed data
5. **CDN**: Static asset distribution
6. **Microservices**: Split into separate services if needed

## Monitoring and Observability

### Recommended Tools

- **Logging**: ELK Stack or CloudWatch
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot or Pingdom

## Future Enhancements

Potential features to add:

1. User authentication and authorization
2. Recipe ratings and reviews
3. Image upload for recipes
4. Full-text search
5. Nutritional information
6. Meal planning
7. Shopping list generation
8. Social sharing
9. Recipe collections/favorites
10. Mobile app (React Native)
