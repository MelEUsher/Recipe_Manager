import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "recipe-manager-api"}


def test_root(client: TestClient):
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


class TestCategories:
    """Test category endpoints"""

    def test_create_category(self, client: TestClient):
        """Test creating a category"""
        response = client.post(
            "/api/categories",
            json={"name": "Desserts", "description": "Sweet treats"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Desserts"
        assert data["description"] == "Sweet treats"
        assert "id" in data

    def test_get_categories(self, client: TestClient):
        """Test getting all categories"""
        # Create a category first
        client.post(
            "/api/categories", json={"name": "Breakfast", "description": "Morning meals"}
        )

        response = client.get("/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_create_duplicate_category(self, client: TestClient):
        """Test creating a category with duplicate name"""
        client.post("/api/categories", json={"name": "Lunch"})
        response = client.post("/api/categories", json={"name": "Lunch"})
        assert response.status_code == 400


class TestRecipes:
    """Test recipe endpoints"""

    def test_create_recipe(self, client: TestClient):
        """Test creating a recipe"""
        recipe_data = {
            "title": "Chocolate Chip Cookies",
            "description": "Classic cookies",
            "instructions": "Mix and bake at 350F for 12 minutes",
            "prep_time": 15,
            "cook_time": 12,
            "servings": 24,
            "ingredients": [
                {"name": "flour", "amount": 2, "unit": "cups"},
                {"name": "sugar", "amount": 1, "unit": "cup"},
            ],
        }
        response = client.post("/api/recipes", json=recipe_data)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == recipe_data["title"]
        assert len(data["ingredients"]) == 2
        assert "id" in data

    def test_get_recipes(self, client: TestClient):
        """Test getting all recipes"""
        # Create a recipe first
        recipe_data = {
            "title": "Pancakes",
            "instructions": "Mix and cook on griddle",
            "ingredients": [],
        }
        client.post("/api/recipes", json=recipe_data)

        response = client.get("/api/recipes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_get_recipe_by_id(self, client: TestClient):
        """Test getting a specific recipe"""
        # Create a recipe
        recipe_data = {
            "title": "Omelette",
            "instructions": "Beat eggs and cook",
            "ingredients": [{"name": "eggs", "amount": 3, "unit": ""}],
        }
        create_response = client.post("/api/recipes", json=recipe_data)
        recipe_id = create_response.json()["id"]

        # Get the recipe
        response = client.get(f"/api/recipes/{recipe_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == recipe_data["title"]
        assert len(data["ingredients"]) == 1

    def test_update_recipe(self, client: TestClient):
        """Test updating a recipe"""
        # Create a recipe
        recipe_data = {
            "title": "Old Title",
            "instructions": "Old instructions",
            "ingredients": [],
        }
        create_response = client.post("/api/recipes", json=recipe_data)
        recipe_id = create_response.json()["id"]

        # Update the recipe
        update_data = {
            "title": "New Title",
            "instructions": "New instructions",
            "ingredients": [],
        }
        response = client.put(f"/api/recipes/{recipe_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title"
        assert data["instructions"] == "New instructions"

    def test_delete_recipe(self, client: TestClient):
        """Test deleting a recipe"""
        # Create a recipe
        recipe_data = {
            "title": "To Delete",
            "instructions": "Will be deleted",
            "ingredients": [],
        }
        create_response = client.post("/api/recipes", json=recipe_data)
        recipe_id = create_response.json()["id"]

        # Delete the recipe
        response = client.delete(f"/api/recipes/{recipe_id}")
        assert response.status_code == 204

        # Verify it's deleted
        get_response = client.get(f"/api/recipes/{recipe_id}")
        assert get_response.status_code == 404

    def test_get_nonexistent_recipe(self, client: TestClient):
        """Test getting a recipe that doesn't exist"""
        response = client.get("/api/recipes/99999")
        assert response.status_code == 404

    def test_search_recipes(self, client: TestClient):
        """Test searching recipes by title"""
        # Create some recipes
        client.post(
            "/api/recipes",
            json={
                "title": "Chocolate Cake",
                "instructions": "Bake",
                "ingredients": [],
            },
        )
        client.post(
            "/api/recipes",
            json={
                "title": "Vanilla Cake",
                "instructions": "Bake",
                "ingredients": [],
            },
        )

        # Search for chocolate
        response = client.get("/api/recipes?search=chocolate")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        assert any("Chocolate" in r["title"] for r in data)
