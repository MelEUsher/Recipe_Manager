from typing import Optional

from pydantic import BaseModel, ConfigDict


class IngredientBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    amount: Optional[str] = None
    unit: Optional[str] = None


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    amount: Optional[str] = None
    unit: Optional[str] = None


class Ingredient(IngredientBase):
    id: int
    recipe_id: int
