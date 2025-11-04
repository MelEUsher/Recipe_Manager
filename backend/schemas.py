from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Ingredient Schemas
class IngredientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    amount: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=50)


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(IngredientBase):
    pass


class Ingredient(IngredientBase):
    id: int
    recipe_id: int

    class Config:
        from_attributes = True


# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Recipe Schemas
class RecipeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    instructions: str = Field(..., min_length=1)
    prep_time: Optional[int] = Field(None, ge=0)
    cook_time: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)
    category_id: Optional[int] = None


class RecipeCreate(RecipeBase):
    ingredients: List[IngredientCreate] = []


class RecipeUpdate(RecipeBase):
    ingredients: Optional[List[IngredientCreate]] = None


class Recipe(RecipeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[Category] = None
    ingredients: List[Ingredient] = []

    class Config:
        from_attributes = True


class RecipeList(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = None
    category: Optional[Category] = None
    created_at: datetime

    class Config:
        from_attributes = True
