from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import schemas
from database import get_db

# Create routers
recipe_router = APIRouter(prefix="/api/recipes", tags=["recipes"])
category_router = APIRouter(prefix="/api/categories", tags=["categories"])


# Recipe endpoints
@recipe_router.get("/", response_model=List[schemas.RecipeList])
def list_recipes(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search in recipe titles"),
    db: Session = Depends(get_db),
):
    """List all recipes with optional filtering"""
    recipes = crud.get_recipes(
        db, skip=skip, limit=limit, category_id=category_id, search=search
    )
    return recipes


@recipe_router.get("/{recipe_id}", response_model=schemas.Recipe)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Get a specific recipe by ID"""
    recipe = crud.get_recipe(db, recipe_id=recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@recipe_router.post("/", response_model=schemas.Recipe, status_code=201)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    """Create a new recipe"""
    try:
        return crud.create_recipe(db=db, recipe=recipe)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@recipe_router.put("/{recipe_id}", response_model=schemas.Recipe)
def update_recipe(
    recipe_id: int, recipe: schemas.RecipeUpdate, db: Session = Depends(get_db)
):
    """Update an existing recipe"""
    db_recipe = crud.update_recipe(db, recipe_id=recipe_id, recipe=recipe)
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return db_recipe


@recipe_router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Delete a recipe"""
    db_recipe = crud.delete_recipe(db, recipe_id=recipe_id)
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return None


# Category endpoints
@category_router.get("/", response_model=List[schemas.Category])
def list_categories(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """List all categories"""
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories


@category_router.get("/{category_id}", response_model=schemas.Category)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category by ID"""
    category = crud.get_category(db, category_id=category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@category_router.post("/", response_model=schemas.Category, status_code=201)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    # Check if category with same name already exists
    db_category = crud.get_category_by_name(db, name=category.name)
    if db_category:
        raise HTTPException(
            status_code=400, detail="Category with this name already exists"
        )
    return crud.create_category(db=db, category=category)


@category_router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int, category: schemas.CategoryUpdate, db: Session = Depends(get_db)
):
    """Update an existing category"""
    db_category = crud.update_category(db, category_id=category_id, category=category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category


@category_router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category"""
    db_category = crud.delete_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return None
