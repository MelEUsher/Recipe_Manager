import { createRecipe, getRecipes, type RecipePayload } from "../lib/api";

describe("API client", () => {
  const fetchMock = jest.spyOn(global, "fetch");

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    fetchMock.mockRestore();
  });

  it("returns parsed recipes from the API", async () => {
    const recipes = [{ id: 1, title: "Test", ingredients: [], created_at: "", updated_at: "" }];
    fetchMock.mockResolvedValue(
      {
        ok: true,
        status: 200,
        json: () => Promise.resolve(recipes),
      } as unknown as Response,
    );

    const result = await getRecipes();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/api/recipes", { cache: "no-store" });
    expect(result).toEqual(recipes);
  });

  it("throws helpful errors from failed responses", async () => {
    const payload: RecipePayload = { title: "Fail", ingredients: [] };
    fetchMock.mockResolvedValue(
      {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: () => Promise.resolve({ detail: "Invalid data" }),
      } as unknown as Response,
    );

    await expect(createRecipe(payload)).rejects.toThrow("Invalid data");
  });
});
