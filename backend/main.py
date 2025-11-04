from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from routers import recipe_router, category_router

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Recipe Manager API...")
    yield
    # Shutdown
    print("Shutting down Recipe Manager API...")


app = FastAPI(
    title="Recipe Manager API",
    description="A REST API for managing recipes, ingredients, and categories",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recipe_router)
app.include_router(category_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Recipe Manager API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "recipe-manager-api"}
