"use client";

import { useEffect, useState } from "react";
import type { IngredientInput, RecipePayload } from "../lib/api";

interface RecipeFormProps {
  initialValues?: RecipePayload;
  onSubmit: (values: RecipePayload) => Promise<void>;
  submitLabel?: string;
}

const defaultIngredient: IngredientInput = { name: "", amount: "", unit: "" };

function buildInitialValues(initialValues?: RecipePayload): RecipePayload {
  if (!initialValues) {
    return {
      title: "",
      description: "",
      instructions: "",
      prep_time: undefined,
      cook_time: undefined,
      servings: undefined,
      category_id: undefined,
      ingredients: [{ ...defaultIngredient }],
    };
  }

  return {
    title: initialValues.title ?? "",
    description: initialValues.description ?? "",
    instructions: initialValues.instructions ?? "",
    prep_time: initialValues.prep_time,
    cook_time: initialValues.cook_time,
    servings: initialValues.servings,
    category_id: initialValues.category_id,
    ingredients:
      initialValues.ingredients?.length && initialValues.ingredients.length > 0
        ? initialValues.ingredients.map((ingredient) => ({
            name: ingredient.name ?? "",
            amount: ingredient.amount ?? "",
            unit: ingredient.unit ?? "",
          }))
        : [{ ...defaultIngredient }],
  };
}

export default function RecipeForm({
  initialValues,
  onSubmit,
  submitLabel = "Save Recipe",
}: RecipeFormProps) {
  const [formValues, setFormValues] = useState<RecipePayload>(buildInitialValues(initialValues));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormValues(buildInitialValues(initialValues));
  }, [initialValues]);

  const handleInputChange = (field: keyof RecipePayload, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumberChange = (field: keyof RecipePayload, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : Number(value),
    }));
  };

  const handleIngredientChange = (index: number, field: keyof IngredientInput, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, ingredientIndex) =>
        ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    }));
  };

  const addIngredient = () => {
    setFormValues((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...defaultIngredient }],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const ingredients = formValues.ingredients.filter(
      (ingredient) => ingredient.name.trim() || ingredient.amount?.trim() || ingredient.unit?.trim(),
    );

    const payload: RecipePayload = {
      ...formValues,
      ingredients,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save recipe.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            value={formValues.title}
            onChange={(event) => handleInputChange("title", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="category">
            Category ID
          </label>
          <input
            id="category"
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            value={formValues.category_id ?? ""}
            onChange={(event) => handleNumberChange("category_id", event.target.value)}
            placeholder="Optional numeric category ID"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="prep_time">
            Prep Time (minutes)
          </label>
          <input
            id="prep_time"
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            value={formValues.prep_time ?? ""}
            onChange={(event) => handleNumberChange("prep_time", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="cook_time">
            Cook Time (minutes)
          </label>
          <input
            id="cook_time"
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            value={formValues.cook_time ?? ""}
            onChange={(event) => handleNumberChange("cook_time", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="servings">
            Servings
          </label>
          <input
            id="servings"
            type="number"
            min={1}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            value={formValues.servings ?? ""}
            onChange={(event) => handleNumberChange("servings", event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          value={formValues.description ?? ""}
          onChange={(event) => handleInputChange("description", event.target.value)}
          placeholder="What makes this recipe special?"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="instructions">
          Instructions
        </label>
        <textarea
          id="instructions"
          className="min-h-[140px] w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          value={formValues.instructions ?? ""}
          onChange={(event) => handleInputChange("instructions", event.target.value)}
          placeholder="Step-by-step directions"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Ingredients</h3>
          <button
            type="button"
            className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
            onClick={addIngredient}
          >
            Add ingredient
          </button>
        </div>

        <div className="space-y-3">
          {formValues.ingredients.map((ingredient, index) => (
            <div
              key={`${ingredient.name}-${index}`}
              className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-12"
            >
              <div className="md:col-span-5">
                <label className="text-xs font-medium text-slate-600" htmlFor={`ingredient-name-${index}`}>
                  Name
                </label>
                <input
                  id={`ingredient-name-${index}`}
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={ingredient.name}
                  onChange={(event) => handleIngredientChange(index, "name", event.target.value)}
                  placeholder="e.g., Tomato"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-medium text-slate-600" htmlFor={`ingredient-amount-${index}`}>
                  Amount
                </label>
                <input
                  id={`ingredient-amount-${index}`}
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={ingredient.amount ?? ""}
                  onChange={(event) => handleIngredientChange(index, "amount", event.target.value)}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-medium text-slate-600" htmlFor={`ingredient-unit-${index}`}>
                  Unit
                </label>
                <input
                  id={`ingredient-unit-${index}`}
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={ingredient.unit ?? ""}
                  onChange={(event) => handleIngredientChange(index, "unit", event.target.value)}
                  placeholder="e.g., cups"
                />
              </div>
              <div className="flex items-center justify-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                  aria-label="Remove ingredient"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
