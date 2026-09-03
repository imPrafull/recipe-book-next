import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { recipesHandlers } from './handlers/recipes';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...authHandlers, ...recipesHandlers);
