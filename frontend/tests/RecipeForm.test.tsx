import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecipeForm from "../components/RecipeForm";
import { getCategories } from "../lib/api";
import type { RecipePayload } from "../lib/api";

jest.mock("../lib/api", () => {
  const actual = jest.requireActual("../lib/api");
  return {
    __esModule: true,
    ...actual,
    getCategories: jest.fn().mockResolvedValue([]),
    createCategory: jest.fn(),
  };
});

const mockedGetCategories = getCategories as jest.Mock;

const baseValues: RecipePayload = {
  title: "Sample",
  description: "Yummy",
  instructions: "Mix well",
  prep_time: 5,
  cook_time: 10,
  servings: 2,
  category_id: 1,
  ingredients: [
    { name: "Flour", amount: "1 cup", unit: "" },
    { name: "Water", amount: "0.5 cup", unit: "" },
  ],
};

describe("RecipeForm", () => {
  beforeEach(() => {
    mockedGetCategories.mockClear();
  });

  it("shows validation error when title is missing", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    render(<RecipeForm onSubmit={handleSubmit} />);

    await user.clear(screen.getByLabelText(/title/i));
    await user.click(screen.getByRole("button", { name: /save recipe/i }));

    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("submits cleaned values and filters empty ingredients", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    render(<RecipeForm initialValues={baseValues} onSubmit={handleSubmit} submitLabel="Submit" />);

    await user.type(screen.getByLabelText(/title/i), " Deluxe");
    await user.clear(screen.getAllByLabelText(/ingredient name/i)[1]);
    await user.click(screen.getByRole("button", { name: /add ingredient/i }));
    const newIngredientInputs = screen.getAllByLabelText(/ingredient name/i);
    await user.type(newIngredientInputs[newIngredientInputs.length - 1], "Salt");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    const payload = handleSubmit.mock.calls[0][0] as RecipePayload;
    expect(payload.title).toBe("Sample Deluxe");
    expect(payload.ingredients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Flour" }),
        expect.objectContaining({ name: "Water" }),
        expect.objectContaining({ name: "Salt" }),
      ]),
    );
    expect(payload.ingredients).toHaveLength(3);
  });
});
