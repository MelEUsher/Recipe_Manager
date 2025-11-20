from typing import List, Optional

from sqlalchemy.orm import Session

from app import models, schemas


def get_ingredient(db: Session, ingredient_id: int) -> Optional[models.Ingredient]:
    return db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()


def get_ingredients_for_recipe(db: Session, recipe_id: int) -> List[models.Ingredient]:
    return (
        db.query(models.Ingredient)
        .filter(models.Ingredient.recipe_id == recipe_id)
        .order_by(models.Ingredient.id)
        .all()
    )


def create_ingredient(db: Session, ingredient_in: schemas.IngredientCreate, recipe_id: int) -> models.Ingredient:
    ingredient = models.Ingredient(recipe_id=recipe_id, **ingredient_in.model_dump())
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


def update_ingredient(
    db: Session, db_ingredient: models.Ingredient, ingredient_in: schemas.IngredientUpdate
) -> models.Ingredient:
    for field, value in ingredient_in.model_dump(exclude_unset=True).items():
        setattr(db_ingredient, field, value)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient


def delete_ingredient(db: Session, db_ingredient: models.Ingredient):
    db.delete(db_ingredient)
    db.commit()
