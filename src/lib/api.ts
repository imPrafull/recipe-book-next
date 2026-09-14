import { authApi } from './api/auth';
import { recipesApi } from './api/recipes';
import { mealPlansApi } from './api/meal-plans';

export const api = {
  ...authApi,
  ...recipesApi,
  ...mealPlansApi,
};

export * from './api/auth';
export * from './api/recipes';
export * from './api/meal-plans';
export * from './api-client';

