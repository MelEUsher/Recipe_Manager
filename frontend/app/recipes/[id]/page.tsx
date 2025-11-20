"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteRecipe, getRecipe, type Recipe } from "../../../lib/api";

interface RecipePageProps {
  params: { id: string };
}

export default function RecipeDetailPage({ params }: RecipePageProps) {
  const router = useRouter();
  const recipeId = Number(params.id);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecipe(recipeId);
        setRecipe(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load recipe.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(recipeId)) {
      fetchRecipe();
    }
  }, [recipeId]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this recipe? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await deleteRecipe(recipeId);
      router.push("/recipes");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete recipe.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-600">Recipe #{params.id}</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {recipe?.title ?? "Recipe details"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/recipes/${recipeId}/edit`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-xl bg-white px-6 py-10 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
            Loading recipe...
          </div>
        ) : recipe ? (
          <div className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Prep time</p>
                <p className="text-lg font-semibold text-slate-900">
                  {recipe.prep_time !== undefined && recipe.prep_time !== null
                    ? `${recipe.prep_time} mins`
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Cook time</p>
                <p className="text-lg font-semibold text-slate-900">
                  {recipe.cook_time !== undefined && recipe.cook_time !== null
                    ? `${recipe.cook_time} mins`
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Servings</p>
                <p className="text-lg font-semibold text-slate-900">
                  {recipe.servings ?? "Flexible"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Category</p>
                <p className="text-lg font-semibold text-slate-900">
                  {recipe.category?.name ?? recipe.category_id ?? "Uncategorized"}
                </p>
              </div>
            </div>

            {recipe.description ? (
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Description</h2>
                <p className="mt-2 text-slate-700">{recipe.description}</p>
              </div>
            ) : null}

            <div>
              <h2 className="text-xl font-semibold text-slate-900">Instructions</h2>
              {recipe.instructions ? (
                <p className="mt-2 whitespace-pre-line text-slate-700">{recipe.instructions}</p>
              ) : (
                <p className="mt-2 text-slate-600">No instructions provided.</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">Ingredients</h2>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id ?? ingredient.name}>
                      <span className="font-semibold text-slate-900">{ingredient.name}</span>
                      {ingredient.amount ? ` — ${ingredient.amount}` : null}
                      {ingredient.unit ? ` ${ingredient.unit}` : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-slate-600">No ingredients listed.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white px-6 py-10 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
            Recipe not found.
          </div>
        )}
      </div>
    </main>
  );
}
