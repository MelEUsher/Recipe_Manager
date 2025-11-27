"use client";

import { useEffect, useState } from "react";
import { createCategory, getCategories, type Category, type CategoryInput, type IngredientInput, type RecipePayload } from "../lib/api";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryInput>({ name: "", description: "" });
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormValues(buildInitialValues(initialValues));
  }, [initialValues]);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await getCategories();
        setCategories([...data].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load categories.";
        setCategoryError(message);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

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

  const handleCategorySelect = (value: string) => {
    setFormValues((prev) => ({
      ...prev,
      category_id: value === "" ? undefined : Number(value),
    }));
  };

  const handleNewCategoryChange = (field: keyof CategoryInput, value: string) => {
    setNewCategory((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setCategoryError("Category name is required.");
      return;
    }

    setCreatingCategory(true);
    setCategoryError(null);

    try {
      const payload: CategoryInput = {
        name: newCategory.name.trim(),
        description: newCategory.description?.trim() || undefined,
      };

      const created = await createCategory(payload);
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setFormValues((prev) => ({
        ...prev,
        category_id: created.id,
      }));
      setShowCategoryForm(false);
      setNewCategory({ name: "", description: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create category.";
      setCategoryError(message);
    } finally {
      setCreatingCategory(false);
    }
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
            Category
          </label>
          <div className="space-y-3">
            <select
              id="category"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={formValues.category_id ?? ""}
              onChange={(event) => handleCategorySelect(event.target.value)}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
                onClick={() => {
                  setShowCategoryForm((prev) => !prev);
                  setCategoryError(null);
                }}
              >
                {showCategoryForm ? "Close new category" : "Add category"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={async () => {
                  setLoadingCategories(true);
                  setCategoryError(null);
                  try {
                    const data = await getCategories();
                    setCategories([...data].sort((a, b) => a.name.localeCompare(b.name)));
                  } catch (err) {
                    const message = err instanceof Error ? err.message : "Failed to refresh categories.";
                    setCategoryError(message);
                  } finally {
                    setLoadingCategories(false);
                  }
                }}
              >
                Refresh
              </button>
              {loadingCategories ? <span className="text-xs text-slate-500">Loading categories…</span> : null}
            </div>
            {categoryError ? <p className="text-sm text-red-600">{categoryError}</p> : null}
            {showCategoryForm ? (
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600" htmlFor="new-category-name">
                      Category Name
                    </label>
                    <input
                      id="new-category-name"
                      type="text"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={newCategory.name}
                      onChange={(event) => handleNewCategoryChange("name", event.target.value)}
                      placeholder="e.g., Vegetarian"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600" htmlFor="new-category-description">
                      Description (optional)
                    </label>
                    <input
                      id="new-category-description"
                      type="text"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={newCategory.description ?? ""}
                      onChange={(event) => handleNewCategoryChange("description", event.target.value)}
                      placeholder="Short summary"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory}
                  >
                    {creatingCategory ? "Saving..." : "Save category"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setNewCategory({ name: "", description: "" });
                      setCategoryError(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
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
                  Ingredient name
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
