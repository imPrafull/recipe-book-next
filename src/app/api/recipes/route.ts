import { Recipe } from '@/lib/types';
import { getRecipes, addRecipe, parseRecipeForm } from '@/lib/recipe-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10));

  let filtered = getRecipes();
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients?.some(i => i.name.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return Response.json({
    success: true,
    data: paged,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = parseRecipeForm(formData);

  if (!parsed.title) {
    return Response.json({ success: false, error: 'Title is required' }, { status: 400 });
  }
  if (!parsed.ingredients?.length) {
    return Response.json({ success: false, error: 'At least one ingredient is required' }, { status: 400 });
  }
  if (!parsed.steps?.length) {
    return Response.json({ success: false, error: 'At least one step is required' }, { status: 400 });
  }

  const newRecipe: Recipe = {
    id: Date.now().toString(),
    title: parsed.title,
    description: parsed.description || '',
    cookingTime: parsed.cookingTime || 0,
    ingredients: parsed.ingredients,
    steps: parsed.steps,
    image: parsed.image || '',
  };

  addRecipe(newRecipe);
  return Response.json({ success: true, data: newRecipe }, { status: 201 });
}
