"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import RecipeForm from "../../../components/RecipeForm";
import { createRecipe, type RecipePayload } from "../../../lib/api";

export default function NewRecipePage() {
  const router = useRouter();

  const handleCreate = async (values: RecipePayload) => {
    try {
      await createRecipe(values);
      router.push("/recipes");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create recipe.";
      throw new Error(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Create</p>
            <h1 className="text-3xl font-semibold text-slate-900">New Recipe</h1>
            <p className="text-sm text-slate-600">Add details, ingredients, and instructions.</p>
          </div>
          <Link
            href="/recipes"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Back to list
          </Link>
        </div>

        <RecipeForm submitLabel="Create Recipe" onSubmit={handleCreate} />
      </div>
    </main>
  );
}
