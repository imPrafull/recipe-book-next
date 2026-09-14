import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { recipesHandlers } from './handlers/recipes';

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...authHandlers, ...recipesHandlers);
