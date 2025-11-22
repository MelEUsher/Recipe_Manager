from app import crud, schemas


def test_category_crud_lifecycle(db_session):
    category_in = schemas.CategoryCreate(name="Desserts", description="Sweet treats")
    created = crud.create_category(db_session, category_in)

    fetched = crud.get_category(db_session, created.id)
    assert fetched is not None
    assert fetched.name == category_in.name

    updated = crud.update_category(db_session, fetched, schemas.CategoryUpdate(description="Updated description"))
    assert updated.description == "Updated description"

    crud.delete_category(db_session, updated)
    assert crud.get_category(db_session, created.id) is None


def test_create_recipe_with_ingredients(db_session):
    category = crud.create_category(db_session, schemas.CategoryCreate(name="Breakfast"))
    recipe_in = schemas.RecipeCreate(
        title="Omelette",
        description="Simple eggs",
        instructions="Whisk and cook.",
        prep_time=5,
        cook_time=10,
        servings=2,
        category_id=category.id,
        ingredients=[
            schemas.IngredientCreate(name="Eggs", amount="3"),
            schemas.IngredientCreate(name="Salt", amount="1 tsp"),
        ],
    )

    recipe = crud.create_recipe(db_session, recipe_in)

    assert recipe.id is not None
    assert recipe.category_id == category.id
    assert len(recipe.ingredients) == 2

    fetched = crud.get_recipe(db_session, recipe.id)
    assert fetched is not None
    assert fetched.title == "Omelette"
    assert {ingredient.name for ingredient in fetched.ingredients} == {"Eggs", "Salt"}


def test_update_recipe_replaces_ingredients(db_session):
    recipe = crud.create_recipe(
        db_session,
        schemas.RecipeCreate(
            title="Pasta",
            description="Basic pasta",
            instructions="Boil and mix.",
            prep_time=10,
            cook_time=15,
            servings=3,
            ingredients=[schemas.IngredientCreate(name="Noodles"), schemas.IngredientCreate(name="Tomato Sauce")],
        ),
    )

    update = schemas.RecipeUpdate(
        title="Pasta Primavera",
        ingredients=[schemas.IngredientCreate(name="Noodles"), schemas.IngredientCreate(name="Peas", amount="1 cup")],
    )
    updated = crud.update_recipe(db_session, recipe, update)

    assert updated.title == "Pasta Primavera"
    assert len(updated.ingredients) == 2
    assert {ingredient.name for ingredient in updated.ingredients} == {"Noodles", "Peas"}


def test_delete_recipe_removes_dependents(db_session):
    recipe = crud.create_recipe(
        db_session,
        schemas.RecipeCreate(
            title="Salad",
            ingredients=[
                schemas.IngredientCreate(name="Lettuce"),
                schemas.IngredientCreate(name="Dressing"),
            ],
        ),
    )

    crud.delete_recipe(db_session, recipe)

    assert crud.get_recipe(db_session, recipe.id) is None
    assert crud.get_ingredients_for_recipe(db_session, recipe.id) == []
