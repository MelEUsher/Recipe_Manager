"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RecipeListItem from "../../components/RecipeListItem";
import { deleteRecipe, getRecipes, type Recipe } from "../../lib/api";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load recipes.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this recipe? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      await deleteRecipe(id);
      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete recipe.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Recipes</p>
            <h1 className="text-3xl font-semibold text-slate-900">Recipe Manager</h1>
            <p className="text-sm text-slate-600">
              Browse, edit, and organize your recipes in one place.
            </p>
          </div>
          <Link
            href="/recipes/new"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Create Recipe
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl bg-white px-6 py-10 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
            Loading recipes...
          </div>
        ) : recipes.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-10 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
            <p className="mb-4 text-lg font-semibold text-slate-900">No recipes yet</p>
            <p className="mb-6 text-sm text-slate-600">
              Create your first recipe to get started.
            </p>
            <Link
              href="/recipes/new"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Add Recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {recipes.map((recipe) => (
              <RecipeListItem
                key={recipe.id}
                recipe={recipe}
                onDelete={handleDelete}
                deleting={deletingId === recipe.id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
