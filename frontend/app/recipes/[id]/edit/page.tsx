"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import RecipeForm from "../../../../components/RecipeForm";
import { getRecipe, type Recipe, type RecipePayload, updateRecipe } from "../../../../lib/api";

interface EditRecipePageProps {
  params: { id: string };
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
  const router = useRouter();
  const recipeId = Number(params.id);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const initialValues: RecipePayload | undefined = useMemo(() => {
    if (!recipe) {
      return undefined;
    }

    return {
      title: recipe.title,
      description: recipe.description ?? "",
      instructions: recipe.instructions ?? "",
      prep_time: recipe.prep_time ?? undefined,
      cook_time: recipe.cook_time ?? undefined,
      servings: recipe.servings ?? undefined,
      category_id: recipe.category_id ?? undefined,
      ingredients: recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        amount: ingredient.amount ?? "",
        unit: ingredient.unit ?? "",
      })),
    };
  }, [recipe]);

  const handleUpdate = async (values: RecipePayload) => {
    try {
      await updateRecipe(recipeId, values);
      router.push(`/recipes/${recipeId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update recipe.";
      throw new Error(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Edit</p>
            <h1 className="text-3xl font-semibold text-slate-900">Update Recipe</h1>
            <p className="text-sm text-slate-600">Make changes to your recipe details.</p>
          </div>
          <Link
            href={`/recipes/${recipeId}`}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Cancel
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl bg-white px-6 py-10 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
            Loading recipe...
          </div>
        ) : initialValues ? (
          <RecipeForm submitLabel="Update Recipe" initialValues={initialValues} onSubmit={handleUpdate} />
        ) : (
          <div className="rounded-xl bg-white px-6 py-10 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
            Recipe not found.
          </div>
        )}
      </div>
    </main>
  );
}
