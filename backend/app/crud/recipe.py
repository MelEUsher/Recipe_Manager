from typing import List, Optional

from sqlalchemy.orm import Session

from app import models, schemas


def get_recipe(db: Session, recipe_id: int) -> Optional[models.Recipe]:
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()


def get_recipes(db: Session, category_id: Optional[int] = None) -> List[models.Recipe]:
    query = db.query(models.Recipe)
    if category_id is not None:
        query = query.filter(models.Recipe.category_id == category_id)
    return query.order_by(models.Recipe.created_at.desc()).all()


def create_recipe(db: Session, recipe_in: schemas.RecipeCreate) -> models.Recipe:
    recipe = models.Recipe(
        title=recipe_in.title,
        description=recipe_in.description,
        instructions=recipe_in.instructions,
        prep_time=recipe_in.prep_time,
        cook_time=recipe_in.cook_time,
        servings=recipe_in.servings,
        category_id=recipe_in.category_id,
    )

    recipe.ingredients = [
        models.Ingredient(name=ingredient.name, amount=ingredient.amount, unit=ingredient.unit)
        for ingredient in recipe_in.ingredients
    ]

    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


def update_recipe(db: Session, db_recipe: models.Recipe, recipe_in: schemas.RecipeUpdate) -> models.Recipe:
    data = recipe_in.model_dump(exclude_unset=True)
    ingredients_data = data.pop("ingredients", None)

    for field, value in data.items():
        setattr(db_recipe, field, value)

    if ingredients_data is not None:
        # Replace the entire ingredient collection to keep DB state aligned with the submitted payload.
        db_recipe.ingredients.clear()
        for ingredient in ingredients_data:
            db_recipe.ingredients.append(
                models.Ingredient(name=ingredient["name"], amount=ingredient.get("amount"), unit=ingredient.get("unit"))
            )

    db.commit()
    db.refresh(db_recipe)
    return db_recipe


def delete_recipe(db: Session, db_recipe: models.Recipe):
    db.delete(db_recipe)
    db.commit()
