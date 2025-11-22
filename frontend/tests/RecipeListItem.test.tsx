import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecipeListItem from "../components/RecipeListItem";
import type { Recipe } from "../lib/api";

const baseRecipe: Recipe = {
  id: 1,
  title: "Test Recipe",
  description: "Tasty test dish",
  instructions: "Cook with love.",
  prep_time: 10,
  cook_time: 20,
  servings: 4,
  category_id: 2,
  category: { id: 2, name: "Dinner", description: "Evening meals" },
  ingredients: [{ id: 1, name: "Salt" }],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("RecipeListItem", () => {
  it("renders recipe details and calculates total time", () => {
    render(<RecipeListItem recipe={baseRecipe} />);

    expect(screen.getByText("Test Recipe")).toBeInTheDocument();
    expect(screen.getByText("Category: Dinner")).toBeInTheDocument();
    expect(screen.getByText("4 servings")).toBeInTheDocument();
    expect(screen.getByText("2 item(s)")).toBeInTheDocument();
    expect(screen.getByText("30 mins")).toBeInTheDocument();
  });

  it("invokes delete handler when delete is pressed", async () => {
    const user = userEvent.setup();
    const handleDelete = jest.fn();

    render(<RecipeListItem recipe={baseRecipe} onDelete={handleDelete} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(handleDelete).toHaveBeenCalledWith(baseRecipe.id);
  });
});
