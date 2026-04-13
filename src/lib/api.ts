import { authApi } from './api/auth';
import { recipesApi } from './api/recipes';

export const api = {
  ...authApi,
  ...recipesApi,
};

export * from './api/auth';
export * from './api/recipes';
export * from './api-client';
