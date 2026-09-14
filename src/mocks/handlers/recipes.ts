import { rest } from 'msw';
import { mockRecipes, createRecipe, validateToken } from '../fixtures';
import type { Recipe } from '../../lib/types';

const BASE_URL = '/api';

// In-memory recipes database for testing
let recipes = [...mockRecipes];

export const recipesHandlers = [
  // GET /recipes - List recipes with pagination and search
  rest.get(`${BASE_URL}/recipes`, (req, res, ctx) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search') || '';
    
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    let isAuthenticated = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const validation = validateToken(token);
      isAuthenticated = validation.valid && !validation.expired;
    }
    
    // Filter recipes by search term
    let filteredRecipes = recipes;
    if (search) {
      filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(search.toLowerCase()) ||
        recipe.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Guest mode restrictions
    const isLimited = !isAuthenticated && page > 1;
    
    if (isLimited) {
      return res(
        ctx.json({
          success: true,
          data: [],
          isLimited: true,
          message: 'Login to see more recipes',
          pagination: {
            page,
            limit,
            total: filteredRecipes.length,
            totalPages: Math.ceil(filteredRecipes.length / limit),
            hasNextPage: false,
            hasPrevPage: page > 1,
          },
        })
      );
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);
    
    // For guest users, cap at first page (10 items max)
    const maxResults = isAuthenticated ? paginatedRecipes : paginatedRecipes.slice(0, 10);
    
    return res(
      ctx.json({
        success: true,
        data: maxResults,
        isLimited: !isAuthenticated && filteredRecipes.length > 10,
        message: !isAuthenticated && filteredRecipes.length > 10 ? 'Login to see more recipes' : undefined,
        pagination: {
          page,
          limit,
          total: filteredRecipes.length,
          totalPages: Math.ceil(filteredRecipes.length / limit),
          hasNextPage: endIndex < filteredRecipes.length,
          hasPrevPage: page > 1,
        },
      })
    );
  }),

  // GET /recipes/:id - Get single recipe
  rest.get(`${BASE_URL}/recipes/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    let isAuthenticated = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const validation = validateToken(token);
      isAuthenticated = validation.valid && !validation.expired;
    }
    
    const recipe = recipes.find(r => r.id === id);
    
    if (!recipe) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Recipe not found',
        })
      );
    }
    
    // Guest mode: hide ingredients and steps
    if (!isAuthenticated) {
      const { ingredients, steps, ...recipeWithoutDetails } = recipe;
      return res(
        ctx.json({
          success: true,
          data: recipeWithoutDetails,
          isLimited: true,
          message: 'Login to see full ingredients and steps',
        })
      );
    }
    
    return res(
      ctx.json({
        success: true,
        data: recipe,
      })
    );
  }),

  // POST /recipes - Create new recipe
  rest.post(`${BASE_URL}/recipes`, async (req, res, ctx) => {
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Authentication required',
        })
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const validation = validateToken(token);
    
    if (!validation.valid) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Invalid token',
        })
      );
    }
    
    if (validation.expired) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Access token expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED',
        })
      );
    }
    
    // Parse multipart form data
    const formData = await req.body;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const cookingTime = parseInt(formData.get('cookingTime') as string, 10);
    const ingredientsStr = formData.get('ingredients') as string;
    const stepsStr = formData.get('steps') as string;
    const image = formData.get('image') as File | null;
    
    // Validate required fields
    if (!title) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: 'Title is required',
        })
      );
    }
    
    // Parse JSON strings
    let ingredients;
    let steps;
    
    try {
      ingredients = ingredientsStr ? JSON.parse(ingredientsStr) : [];
      steps = stepsStr ? JSON.parse(stepsStr) : [];
    } catch (error) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: 'Invalid ingredients or steps format',
        })
      );
    }
    
    // Create new recipe
    const newRecipe = createRecipe({
      id: `recipe-${Date.now()}`,
      title,
      description: description || '',
      cookingTime: cookingTime || 0,
      ingredients,
      steps,
      image: image ? `https://mock-s3.example.com/${image.name}` : 'https://via.placeholder.com/400x300',
    });
    
    recipes.push(newRecipe);
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newRecipe,
      })
    );
  }),

  // PUT /recipes/:id - Update recipe
  rest.put(`${BASE_URL}/recipes/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Authentication required',
        })
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const validation = validateToken(token);
    
    if (!validation.valid || validation.expired) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: validation.expired ? 'Access token expired. Please refresh your token.' : 'Invalid token',
          code: validation.expired ? 'TOKEN_EXPIRED' : undefined,
        })
      );
    }
    
    const recipeIndex = recipes.findIndex(r => r.id === id);
    
    if (recipeIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Recipe not found',
        })
      );
    }
    
    // Parse multipart form data
    const formData = await req.body;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const cookingTime = formData.get('cookingTime') as string;
    const ingredientsStr = formData.get('ingredients') as string;
    const stepsStr = formData.get('steps') as string;
    const image = formData.get('image') as File | null;
    
    // Parse JSON strings
    let ingredients;
    let steps;
    
    try {
      ingredients = ingredientsStr ? JSON.parse(ingredientsStr) : recipes[recipeIndex].ingredients;
      steps = stepsStr ? JSON.parse(stepsStr) : recipes[recipeIndex].steps;
    } catch (error) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: 'Invalid ingredients or steps format',
        })
      );
    }
    
    // Update recipe
    const updatedRecipe: Recipe = {
      ...recipes[recipeIndex],
      title: title || recipes[recipeIndex].title,
      description: description || recipes[recipeIndex].description,
      cookingTime: cookingTime ? parseInt(cookingTime, 10) : recipes[recipeIndex].cookingTime,
      ingredients,
      steps,
      image: image ? `https://mock-s3.example.com/${image.name}` : recipes[recipeIndex].image,
    };
    
    recipes[recipeIndex] = updatedRecipe;
    
    return res(
      ctx.json({
        success: true,
        data: updatedRecipe,
      })
    );
  }),

  // DELETE /recipes/:id - Delete recipe
  rest.delete(`${BASE_URL}/recipes/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Authentication required',
        })
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const validation = validateToken(token);
    
    if (!validation.valid || validation.expired) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: validation.expired ? 'Access token expired. Please refresh your token.' : 'Invalid token',
          code: validation.expired ? 'TOKEN_EXPIRED' : undefined,
        })
      );
    }
    
    const recipeIndex = recipes.findIndex(r => r.id === id);
    
    if (recipeIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Recipe not found',
        })
      );
    }
    
    recipes.splice(recipeIndex, 1);
    
    return res(
      ctx.json({
        success: true,
        data: {
          message: 'Recipe deleted successfully',
        },
      })
    );
  }),
];
