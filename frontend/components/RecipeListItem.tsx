"use client";

import Link from "next/link";
import type { Recipe } from "../lib/api";

interface RecipeListItemProps {
  recipe: Recipe;
  onDelete?: (id: number) => void;
  deleting?: boolean;
}

export default function RecipeListItem({ recipe, onDelete, deleting }: RecipeListItemProps) {
  const prepCook = [recipe.prep_time, recipe.cook_time].filter((time) => typeof time === "number");
  const totalTime =
    prepCook.length > 0 ? prepCook.reduce((sum, time) => sum + (time || 0), 0) : undefined;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-indigo-600">#{recipe.id}</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{recipe.title}</h3>
          {recipe.category ? (
            <p className="text-sm text-indigo-700">Category: {recipe.category.name}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {recipe.servings ? `${recipe.servings} servings` : "Flexible servings"}
        </span>
      </div>

      {recipe.description ? (
        <p className="mt-3 text-sm text-slate-700">{recipe.description}</p>
      ) : (
        <p className="mt-3 text-sm text-slate-500 italic">No description provided.</p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="font-semibold text-slate-800">Prep</p>
          <p>{recipe.prep_time ? `${recipe.prep_time} mins` : "—"}</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="font-semibold text-slate-800">Cook</p>
          <p>{recipe.cook_time ? `${recipe.cook_time} mins` : "—"}</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="font-semibold text-slate-800">Total</p>
          <p>{totalTime !== undefined ? `${totalTime} mins` : "—"}</p>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Ingredients</p>
        <p>{recipe.ingredients?.length ? recipe.ingredients.length : 0} item(s)</p>
      </div>

      <div className="mt-auto flex items-center gap-3 pt-4">
        <Link
          href={`/recipes/${recipe.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:text-indigo-700"
        >
          View
        </Link>
        <Link
          href={`/recipes/${recipe.id}/edit`}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Edit
        </Link>
        {onDelete ? (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onDelete(recipe.id)}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
