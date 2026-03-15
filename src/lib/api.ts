import { Recipe } from '@/components/RecipeCard';

const API_BASE = '/api/recipes';

export const api = {
  async getRecipes(search?: string): Promise<Recipe[]> {
    const url = search ? `${API_BASE}?search=${encodeURIComponent(search)}` : API_BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch recipes');
    return res.json();
  },

  async getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch recipe');
    return res.json();
  },

  async createRecipe(data: Partial<Recipe>): Promise<Recipe> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create recipe');
    return res.json();
  },

  async updateRecipe(id: string, data: Partial<Recipe>): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update recipe');
    return res.json();
  },

  async deleteRecipe(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete recipe');
  }
};
