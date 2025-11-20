from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.category import Category
from app.schemas.ingredient import Ingredient, IngredientCreate


class RecipeBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = None
    category_id: Optional[int] = None


class RecipeCreate(RecipeBase):
    ingredients: List[IngredientCreate] = []


class RecipeUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = None
    category_id: Optional[int] = None
    ingredients: Optional[List[IngredientCreate]] = None


class Recipe(RecipeBase):
    id: int
    ingredients: List[Ingredient] = []
    category: Optional[Category] = None
    created_at: datetime
    updated_at: datetime
