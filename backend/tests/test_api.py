from fastapi import status


def create_category(client, name="Main Dishes", description="Savory"):
    response = client.post("/api/categories", json={"name": name, "description": description})
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "ok"}


def test_create_and_get_recipe_via_api(client):
    category = create_category(client)
    payload = {
        "title": "Tomato Soup",
        "description": "Comforting soup",
        "instructions": "Simmer tomatoes.",
        "prep_time": 10,
        "cook_time": 20,
        "servings": 4,
        "category_id": category["id"],
        "ingredients": [
            {"name": "Tomatoes", "amount": "4 cups"},
            {"name": "Basil", "amount": "2 tbsp"},
        ],
    }

    create_response = client.post("/api/recipes", json=payload)
    assert create_response.status_code == status.HTTP_201_CREATED
    recipe = create_response.json()

    assert recipe["title"] == payload["title"]
    assert len(recipe["ingredients"]) == 2
    assert recipe["category"]["id"] == category["id"]

    get_response = client.get(f"/api/recipes/{recipe['id']}")
    assert get_response.status_code == status.HTTP_200_OK
    fetched = get_response.json()
    assert fetched["title"] == payload["title"]
    assert fetched["ingredients"][0]["name"] == "Tomatoes"


def test_list_recipes_filters_by_category(client):
    dessert_category = create_category(client, name="Dessert")
    dinner_category = create_category(client, name="Dinner")

    client.post(
        "/api/recipes",
        json={"title": "Cake", "ingredients": [{"name": "Flour"}], "category_id": dessert_category["id"]},
    )
    client.post(
        "/api/recipes",
        json={"title": "Stew", "ingredients": [{"name": "Beef"}], "category_id": dinner_category["id"]},
    )

    response = client.get("/api/recipes", params={"category_id": dessert_category["id"]})
    assert response.status_code == status.HTTP_200_OK

    recipes = response.json()
    assert len(recipes) == 1
    assert recipes[0]["title"] == "Cake"
    assert recipes[0]["category"]["name"] == "Dessert"


def test_update_and_delete_recipe(client):
    recipe_response = client.post("/api/recipes", json={"title": "Sandwich", "ingredients": [{"name": "Bread"}]})
    recipe = recipe_response.json()

    update_response = client.put(
        f"/api/recipes/{recipe['id']}",
        json={"title": "Grilled Sandwich", "ingredients": [{"name": "Bread"}, {"name": "Cheese"}]},
    )
    assert update_response.status_code == status.HTTP_200_OK
    updated = update_response.json()
    assert updated["title"] == "Grilled Sandwich"
    assert len(updated["ingredients"]) == 2

    delete_response = client.delete(f"/api/recipes/{recipe['id']}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    missing_response = client.get(f"/api/recipes/{recipe['id']}")
    assert missing_response.status_code == status.HTTP_404_NOT_FOUND
