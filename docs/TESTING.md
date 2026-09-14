# Testing Guide for Recipe Book

This project uses a comprehensive testing strategy with **Jest** for unit tests, **Playwright** for E2E tests, and **MSW (Mock Service Worker)** for API mocking.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Testing Stack](#testing-stack)
- [Project Structure](#project-structure)
- [Writing Tests](#writing-tests)
- [MSW API Mocking](#msw-api-mocking)
- [Playwright E2E Tests](#playwright-e2e-tests)
- [Debugging](#debugging)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

---

## Overview

### Testing Pyramid

```
       E2E Tests (Playwright)
      /                      \
   Integration Tests (Jest + MSW)
  /                              \
Unit Tests (Jest + React Testing Library)
```

- **Unit Tests**: Fast, isolated tests for components, hooks, and utilities
- **Integration Tests**: Test API client and data flow with MSW
- **E2E Tests**: Full user flows in a real browser with Playwright

### Why MSW?

We use MSW instead of mocking axios/fetch directly because:
- ✅ **Refactor-safe**: Survives changes from `fetch` → `axios` or vice versa
- ✅ **Contract-aligned**: Mocks match `docs/API_CONTRACT.md` exactly
- ✅ **Realistic**: Tests the actual HTTP layer, not internal implementation
- ✅ **Reusable**: Same handlers work for Jest and Playwright

---

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests in watch mode
npm run test

# Run tests once (CI mode) with coverage
npm run test:ci

# Run specific test file
npm run test -- SearchBar.test.tsx

# Run tests matching a pattern
npm run test -- --testNamePattern="should fetch recipes"
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- tests/e2e/auth.spec.ts

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Debug E2E tests
npm run test:e2e -- --debug
```

### Run All Tests

```bash
npm run test:all
```

---

## Testing Stack

### Core Dependencies

| Tool | Purpose | Version |
|------|---------|---------|
| **Jest** | Unit test runner | Latest |
| **@testing-library/react** | React component testing | Latest |
| **@testing-library/jest-dom** | Custom Jest matchers | Latest |
| **@testing-library/user-event** | User interaction simulation | Latest |
| **MSW** | API mocking at network level | Latest |
| **@playwright/test** | E2E test framework | Latest |

---

## Project Structure

```
recipe-book-next/
├── src/
│   ├── components/
│   │   ├── __tests__/           # Component unit tests
│   │   │   ├── SearchBar.test.tsx
│   │   │   └── RecipeCard.test.tsx
│   │   └── SearchBar.tsx
│   ├── hooks/
│   │   ├── __tests__/           # Hook unit tests
│   │   │   ├── use-recipes.test.ts
│   │   │   └── use-recipe.test.ts
│   │   └── use-recipes.ts
│   ├── lib/
│   │   ├── __tests__/           # Library unit tests
│   │   │   └── api-client.test.ts
│   │   ├── api/
│   │   │   ├── __tests__/       # API module tests
│   │   │   │   ├── auth.test.ts
│   │   │   │   └── recipes.test.ts
│   │   │   ├── auth.ts
│   │   │   └── recipes.ts
│   │   └── api-client.ts
│   └── mocks/                   # MSW mocks (shared by Jest + Playwright)
│       ├── handlers/
│       │   ├── auth.ts          # Auth endpoint handlers
│       │   └── recipes.ts       # Recipes endpoint handlers
│       ├── fixtures.ts          # Mock data factories
│       ├── server.ts            # MSW server for Node (Jest)
│       └── browser.ts           # MSW worker for browser (Playwright)
├── tests/                       # Playwright E2E tests
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── recipes-create.spec.ts
│   │   ├── recipes-browse.spec.ts
│   │   └── guest-mode.spec.ts
│   ├── fixtures/
│   │   └── test-recipe-image.jpg  # Test image for upload tests
│   └── auth.setup.ts            # Shared auth state for E2E
├── jest.config.ts               # Jest configuration
├── jest.setup.ts                # Jest setup (MSW server, mocks)
└── playwright.config.ts         # Playwright configuration
```

---

## Writing Tests

### Unit Tests (Jest + React Testing Library)

#### Component Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn(() => '') })),
}));

describe('SearchBar', () => {
  it('should handle search submission', async () => {
    render(<SearchBar variant="navbar" />);
    
    const input = screen.getByPlaceholderText('Search recipes...');
    fireEvent.change(input, { target: { value: 'pizza' } });
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    // Assertions...
  });
});
```

#### Hook Test Example

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useRecipes } from '../use-recipes';

describe('useRecipes', () => {
  it('should fetch recipes on mount', async () => {
    const { result } = renderHook(() => useRecipes({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes).toBeDefined();
  });
});
```

#### API Client Test Example

```typescript
import { fetchWithAuth, API_BASE } from '../api-client';
import { createAuthTokens } from '@/mocks/fixtures';

describe('fetchWithAuth', () => {
  it('should add Bearer token header', async () => {
    const tokens = createAuthTokens('test-user-id');
    localStorage.setItem('accessToken', tokens.accessToken);

    const response = await fetchWithAuth(`${API_BASE}/auth/me`);
    
    expect(response.ok).toBe(true);
  });
});
```

### localStorage Mock

`jest.setup.ts` provides a mock localStorage that resets between tests:

```typescript
// No setup needed - it's automatic!
localStorage.setItem('accessToken', 'token');
localStorage.getItem('accessToken'); // => 'token'
```

---

## MSW API Mocking

### How It Works

MSW intercepts HTTP requests at the network level:

```
Component → fetch/axios → MSW Handler → Mock Response
```

### Adding New Handlers

#### 1. Define Mock Data in `fixtures.ts`

```typescript
export function createRecipe(overrides = {}): Recipe {
  return {
    id: `recipe-${Date.now()}`,
    title: 'Test Recipe',
    // ...
    ...overrides,
  };
}
```

#### 2. Create Handler in `handlers/recipes.ts`

```typescript
import { http, HttpResponse } from 'msw';

export const recipesHandlers = [
  http.get('/api/recipes', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    
    // Filter logic...
    
    return HttpResponse.json({
      success: true,
      data: filteredRecipes,
      pagination: { /* ... */ },
    });
  }),
];
```

#### 3. Export from `server.ts` and `browser.ts`

```typescript
// server.ts (Jest)
import { setupServer } from 'msw/node';
import { recipesHandlers } from './handlers/recipes';

export const server = setupServer(...recipesHandlers);
```

### Testing Auth Flows

MSW handlers simulate token expiry and refresh:

```typescript
// Use expired token
const tokens = createAuthTokens('user-id', true); // expired = true
localStorage.setItem('accessToken', tokens.accessToken);

// This will trigger automatic token refresh
await fetchWithAuth('/api/recipes');

// New token should be in localStorage
const newToken = localStorage.getItem('accessToken');
expect(newToken).not.toBe(tokens.accessToken);
```

### Guest Mode Testing

```typescript
// Clear tokens to simulate guest
localStorage.clear();

// Guest users get limited results
const result = await recipesApi.getRecipes({ page: 2 });
expect(result.isLimited).toBe(true);
expect(result.message).toContain('Login');
```

---

## Playwright E2E Tests

### Shared Authentication

E2E tests use shared auth state to avoid logging in for every test:

```typescript
// tests/auth.setup.ts - Runs once before all tests
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /log in/i }).click();
  
  // Save auth state
  await page.context().storageState({ path: 'tests/.auth/user.json' });
});
```

All tests automatically use this auth state unless you opt out:

```typescript
// Authenticated test (default)
test('should create recipe', async ({ page }) => {
  await page.goto('/recipes/new');
  // Already logged in!
});

// Guest test (opt out)
test.use({ storageState: { cookies: [], origins: [] } });
test('should hide ingredients for guests', async ({ page }) => {
  await page.goto('/recipes/recipe-1');
  // Not logged in
});
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Recipe Creation', () => {
  test('should create recipe with image', async ({ page }) => {
    await page.goto('/recipes/new');
    
    // Fill form
    await page.getByLabel('Title').fill('Test Recipe');
    await page.getByLabel('Description').fill('Description');
    
    // Upload real image file
    const imagePath = 'tests/fixtures/test-recipe-image.jpg';
    await page.getByLabel(/recipe image/i).setInputFiles(imagePath);
    
    // Submit
    await page.getByRole('button', { name: /create/i }).click();
    
    // Verify redirect
    await page.waitForURL(/\/recipes\/[^/]+$/);
    await expect(page.getByRole('heading', { name: 'Test Recipe' })).toBeVisible();
  });
});
```

### Image Upload Testing

**Important**: E2E tests use a **real image file** (not mocked) to test the full pipeline:

```
Browser → File Input → FormData → Multipart Request → Backend → S3
```

1. Add small test image to `tests/fixtures/test-recipe-image.jpg` (~30-50KB)
2. Use `page.setInputFiles()` in tests
3. Verify upload in E2E environment (requires test/mock S3 or LocalStack in CI)

⚠️ **Blocker**: E2E tests with image uploads require S3 test credentials or LocalStack setup.

---

## Debugging

### Jest Tests

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Use VS Code debugger
# Add breakpoint → Run "Debug Jest Tests" from Run menu
```

### Playwright Tests

```bash
# Run with Playwright Inspector
npm run test:e2e -- --debug

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run in UI mode (interactive explorer)
npm run test:e2e:ui
```

### MSW Debugging

Enable request logging in `jest.setup.ts`:

```typescript
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn', // Log unhandled requests
  });
  
  // Optional: Log all requests
  server.events.on('request:start', ({ request }) => {
    console.log('MSW intercepted:', request.method, request.url);
  });
});
```

---

## CI/CD Integration

### GitHub Actions (Future)

When ready to add CI/CD, create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:ci
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Coverage Enforcement (Future)

Add to `jest.config.ts` when ready:

```typescript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

---

## Best Practices

### ✅ Do

- **Test behavior, not implementation**: Focus on what users see/do
- **Use MSW for API tests**: Don't mock fetch/axios directly
- **Keep tests independent**: Each test should run in isolation
- **Use meaningful test names**: `should allow searching for recipes`
- **Follow AAA pattern**: Arrange, Act, Assert
- **Use data-testid sparingly**: Prefer semantic queries (getByRole, getByLabel)
- **Reset state**: `beforeEach(() => localStorage.clear())`

### ❌ Don't

- **Don't test library code**: Trust React, Next.js work correctly
- **Don't over-mock**: Use real components when possible
- **Don't test CSS**: Focus on functionality
- **Don't game coverage**: Write meaningful tests, not metric-chasing tests
- **Don't skip cleanup**: Always cleanup timers, listeners, state
- **Don't hardcode IDs**: Use flexible selectors

### Test Organization

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  describe('feature group', () => {
    it('should do specific thing', () => {
      // Test
    });
  });
});
```

### Naming Conventions

```typescript
// ✅ Good
it('should display validation error when email is invalid')
it('should fetch recipes on mount')
it('should hide ingredients for guest users')

// ❌ Bad
it('works')
it('test email validation')
it('guest mode')
```

---

## Troubleshooting

### "localStorage is not defined"

✅ Fixed automatically by `jest.setup.ts`. If you see this, ensure:
- `setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']` in `jest.config.ts`
- Running tests with `npm run test`, not `node --test`

### MSW Handlers Not Working

Check:
1. Is `server.listen()` called in `jest.setup.ts`?
2. Are handlers exported from `server.ts`?
3. Does the request URL match the handler pattern exactly?
4. Enable logging: `server.listen({ onUnhandledRequest: 'warn' })`

### Playwright Tests Timeout

Check:
1. Is Next.js dev server running? (`webServer` in `playwright.config.ts` should start it)
2. Is test waiting for navigation? Use `await page.waitForURL()`
3. Increase timeout: `test.setTimeout(60000)`

### Test Image Missing

See `tests/fixtures/README.md` for instructions on creating `test-recipe-image.jpg`.

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [API Contract](./API_CONTRACT.md)

---

## Questions?

For testing issues, check:
1. This guide's Troubleshooting section
2. MSW handler logs in console
3. Playwright Inspector (`--debug` flag)
4. Jest error messages (usually very helpful!)
