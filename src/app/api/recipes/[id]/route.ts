import { findRecipe, findRecipeIndex, updateRecipe, removeRecipe, parseRecipeForm } from '@/lib/recipe-store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recipe = findRecipe(id);
  if (!recipe) {
    return Response.json({ success: false, error: 'Recipe not found' }, { status: 404 });
  }
  return Response.json({ success: true, data: recipe });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = findRecipeIndex(id);
  if (index === -1) {
    return Response.json({ success: false, error: 'Recipe not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const parsed = parseRecipeForm(formData);
  const existing = findRecipe(id)!;
  const updated = { ...existing, ...parsed, id };
  updateRecipe(index, updated);
  return Response.json({ success: true, data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const removed = removeRecipe(id);

  if (!removed) {
    return Response.json({ success: false, error: 'Recipe not found' }, { status: 404 });
  }

  return Response.json({ success: true, data: { message: 'Recipe deleted successfully' } });
}
