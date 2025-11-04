from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import models
import schemas


# Category CRUD operations
def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()


def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category: schemas.CategoryUpdate):
    db_category = get_category(db, category_id)
    if db_category:
        for key, value in category.model_dump().items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category


# Recipe CRUD operations
def get_recipe(db: Session, recipe_id: int):
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()


def get_recipes(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
):
    query = db.query(models.Recipe)

    if category_id:
        query = query.filter(models.Recipe.category_id == category_id)

    if search:
        query = query.filter(
            func.lower(models.Recipe.title).contains(func.lower(search))
        )

    return query.offset(skip).limit(limit).all()


def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    # Extract ingredients data
    ingredients_data = recipe.model_dump().pop("ingredients", [])

    # Create recipe
    db_recipe = models.Recipe(**recipe.model_dump(exclude={"ingredients"}))
    db.add(db_recipe)
    db.flush()  # Flush to get the recipe ID

    # Create ingredients
    for ingredient_data in ingredients_data:
        db_ingredient = models.Ingredient(**ingredient_data, recipe_id=db_recipe.id)
        db.add(db_ingredient)

    db.commit()
    db.refresh(db_recipe)
    return db_recipe


def update_recipe(db: Session, recipe_id: int, recipe: schemas.RecipeUpdate):
    db_recipe = get_recipe(db, recipe_id)
    if not db_recipe:
        return None

    # Update recipe fields
    recipe_data = recipe.model_dump(exclude={"ingredients"})
    for key, value in recipe_data.items():
        if value is not None:
            setattr(db_recipe, key, value)

    # Update ingredients if provided
    if recipe.ingredients is not None:
        # Delete existing ingredients
        db.query(models.Ingredient).filter(
            models.Ingredient.recipe_id == recipe_id
        ).delete()

        # Create new ingredients
        for ingredient_data in recipe.ingredients:
            db_ingredient = models.Ingredient(
                **ingredient_data.model_dump(), recipe_id=recipe_id
            )
            db.add(db_ingredient)

    db.commit()
    db.refresh(db_recipe)
    return db_recipe


def delete_recipe(db: Session, recipe_id: int):
    db_recipe = get_recipe(db, recipe_id)
    if db_recipe:
        db.delete(db_recipe)
        db.commit()
    return db_recipe
