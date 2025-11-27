const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface IngredientInput {
  name: string;
  amount?: string;
  unit?: string;
}

export interface Ingredient extends IngredientInput {
  id?: number;
  recipe_id?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface CategoryInput {
  name: string;
  description?: string;
}

export interface RecipePayload {
  title: string;
  description?: string;
  instructions?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  category_id?: number;
  ingredients: IngredientInput[];
}

export interface Recipe extends RecipePayload {
  id: number;
  category?: Category | null;
  ingredients: Ingredient[];
  created_at: string;
  updated_at: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      if (typeof data === "string") {
        message = data;
      } else if (data?.detail) {
        message = Array.isArray(data.detail) ? data.detail.join(", ") : data.detail;
      }
    } catch {
      // Ignore JSON parse errors and fall back to status text.
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  // Some endpoints (e.g., DELETE) may not return JSON.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${API_BASE_URL}/api/recipes`, {
    cache: "no-store",
  });
  return handleResponse<Recipe[]>(response);
}

export async function getRecipe(id: number | string): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
    cache: "no-store",
  });
  return handleResponse<Recipe>(response);
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    cache: "no-store",
  });
  return handleResponse<Category[]>(response);
}

export async function createCategory(payload: CategoryInput): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Category>(response);
}

export async function createRecipe(payload: RecipePayload): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/api/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Recipe>(response);
}

export async function updateRecipe(id: number | string, payload: RecipePayload): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Recipe>(response);
}

export async function deleteRecipe(id: number | string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
    method: "DELETE",
  });
  await handleResponse<void>(response);
}
