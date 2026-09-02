import { API_BASE, fetchWithAuth, unwrap, PaginationMeta } from '../api-client';
import type { Recipe } from '@/lib/types';

const RECIPE_ENDPOINT = `/recipes`;
const RECIPE_URL = `${API_BASE}${RECIPE_ENDPOINT}`;

export interface GetRecipesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetRecipesResult {
  recipes: Recipe[];
  pagination?: PaginationMeta;
  isLimited?: boolean;
  message?: string;
}

export interface GetRecipeResult {
  recipe: Recipe;
  isLimited?: boolean;
  message?: string;
}

export const recipesApi = {
  async getRecipes(params: GetRecipesParams = {}): Promise<GetRecipesResult> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${RECIPE_URL}?${query}` : RECIPE_URL;
    const res = await fetchWithAuth(url);
    const envelope = await unwrap<Recipe[]>(res);

    return {
      recipes: Array.isArray(envelope.data) ? envelope.data : [],
      pagination: envelope.pagination,
      isLimited: envelope.isLimited,
      message: envelope.message,
    };
  },

  async getRecipe(id: string): Promise<GetRecipeResult> {
    const res = await fetchWithAuth(`${RECIPE_URL}/${id}`);
    const envelope = await unwrap<Recipe>(res);
    return {
      recipe: envelope.data,
      isLimited: envelope.isLimited,
      message: envelope.message,
    };
  },

  async createRecipe(formData: FormData): Promise<Recipe> {
    const res = await fetchWithAuth(RECIPE_URL, {
      method: 'POST',
      body: formData,
    });
    const envelope = await unwrap<Recipe>(res);
    return envelope.data;
  },

  async updateRecipe(id: string, formData: FormData): Promise<Recipe> {
    const res = await fetchWithAuth(`${RECIPE_URL}/${id}`, {
      method: 'PUT',
      body: formData,
    });
    const envelope = await unwrap<Recipe>(res);
    return envelope.data;
  },

  async deleteRecipe(id: string): Promise<string> {
    const res = await fetchWithAuth(`${RECIPE_URL}/${id}`, {
      method: 'DELETE',
    });
    const envelope = await unwrap<{ message: string }>(res);
    return envelope.data.message;
  },
};
