import { Recipe } from '@/components/RecipeCard';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const RECIPE_ENDPOINT = `/recipes`;
const RECIPE_URL = `${API_BASE}${RECIPE_ENDPOINT}`;

// ---------------------------------------------------------------------------
// Response envelope types (as defined in the API contract)
// ---------------------------------------------------------------------------

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ---------------------------------------------------------------------------
// Helper: unwrap envelope or throw with the server's error message
// ---------------------------------------------------------------------------

async function unwrap<T>(res: Response): Promise<SuccessResponse<T>> {
  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new Error(json.error ?? `Request failed with status ${res.status}`);
  }

  return json;
}

// ---------------------------------------------------------------------------
// Pagination params for getRecipes
// ---------------------------------------------------------------------------

export interface GetRecipesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetRecipesResult {
  recipes: Recipe[];
  pagination?: PaginationMeta;
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

export const api = {
  async getRecipes(params: GetRecipesParams = {}): Promise<GetRecipesResult> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${RECIPE_URL}?${query}` : RECIPE_URL;
    const res = await fetch(url);
    const envelope = await unwrap<Recipe[]>(res);

    return {
      recipes: Array.isArray(envelope.data) ? envelope.data : [],
      pagination: envelope.pagination,
    };
  },

  async getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`${RECIPE_URL}/${id}`);
    const envelope = await unwrap<Recipe>(res);
    return envelope.data;
  },

  async createRecipe(data: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
    const res = await fetch(RECIPE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const envelope = await unwrap<Recipe>(res);
    return envelope.data;
  },

  async updateRecipe(id: string, data: Partial<Omit<Recipe, 'id' | 'createdAt'>>): Promise<Recipe> {
    const res = await fetch(`${RECIPE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const envelope = await unwrap<Recipe>(res);
    return envelope.data;
  },

  async deleteRecipe(id: string): Promise<string> {
    const res = await fetch(`${RECIPE_URL}/${id}`, {
      method: 'DELETE',
    });
    const envelope = await unwrap<{ message: string }>(res);
    return envelope.data.message;
  },
};
