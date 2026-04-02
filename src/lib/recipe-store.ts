import { Recipe } from '@/components/RecipeCard';

// ---------------------------------------------------------------------------
// In-memory recipe store (shared across all API route handlers)
// ---------------------------------------------------------------------------

let recipes: Recipe[] = [
  {
    id: '1',
    title: 'Creamy Garlic Parmesan Pasta',
    description:
      'A rich and delicious pasta dish ready in under 30 minutes. Perfect for easy weeknight dinners.',
    cookingTime: 25,
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: [
      '8 oz fettuccine or linguine',
      '2 tbsp butter',
      '4 cloves garlic, minced',
      '1 cup heavy cream',
      '1/2 cup grated Parmesan cheese',
      'Salt and pepper to taste',
    ],
    steps: [
      'Boil pasta in salted water according to package instructions.',
      'Melt butter in a large skillet over medium heat.',
      'Add minced garlic and sauté until fragrant (about 1 minute).',
      'Stir in heavy cream and let it simmer for 3-4 minutes until slightly thickened.',
      'Whisk in Parmesan cheese until smooth.',
      'Toss the cooked pasta in the sauce. Serve hot with extra cheese!',
    ],
  },
  {
    id: '2',
    title: 'Classic Avocado Toast',
    description: 'Simple, healthy, and incredibly satisfying breakfast.',
    cookingTime: 10,
    image:
      'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80',
    ingredients: [
      '2 slices sourdough bread',
      '1 ripe avocado',
      '1/2 lemon, juiced',
      'Pinch of red pepper flakes',
      'Sea salt and black pepper',
    ],
    steps: [
      'Toast the bread slices until golden brown.',
      'Cut the avocado in half, remove the pit, and scoop the flesh into a bowl.',
      'Mash the avocado with lemon juice, salt, and pepper.',
      'Spread the mashed avocado evenly onto the toast.',
      'Sprinkle with red pepper flakes and serve immediately.',
    ],
  },
];

export function getRecipes() {
  return recipes;
}

export function findRecipe(id: string) {
  return recipes.find((r) => r.id === id);
}

export function findRecipeIndex(id: string) {
  return recipes.findIndex((r) => r.id === id);
}

export function addRecipe(recipe: Recipe) {
  recipes.push(recipe);
}

export function updateRecipe(index: number, recipe: Recipe) {
  recipes[index] = recipe;
}

export function removeRecipe(id: string): boolean {
  const before = recipes.length;
  recipes = recipes.filter((r) => r.id !== id);
  return recipes.length < before;
}

// ---------------------------------------------------------------------------
// Parse a recipe from multipart/form-data
// ---------------------------------------------------------------------------

export function parseRecipeForm(formData: FormData): Partial<Omit<Recipe, 'id'>> {
  const data: Partial<Omit<Recipe, 'id'>> = {};

  const title = formData.get('title');
  if (typeof title === 'string' && title) data.title = title;

  const description = formData.get('description');
  if (typeof description === 'string') data.description = description;

  const cookingTime = formData.get('cookingTime');
  if (cookingTime !== null) data.cookingTime = Number(cookingTime) || 0;

  const ingredients = formData.get('ingredients');
  if (typeof ingredients === 'string') {
    try { data.ingredients = JSON.parse(ingredients); } catch { /* skip */ }
  }

  const steps = formData.get('steps');
  if (typeof steps === 'string') {
    try { data.steps = JSON.parse(steps); } catch { /* skip */ }
  }

  // In a real backend the File would go to S3 via multer; here we keep the existing URL
  const image = formData.get('image');
  if (typeof image === 'string' && image) data.image = image;

  return data;
}
