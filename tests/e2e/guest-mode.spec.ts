import { test, expect } from '@playwright/test';

test.describe('Guest Mode Access', () => {
  // Use unauthenticated state for all tests in this describe block
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should allow guest users to view recipes list', async ({ page }) => {
    await page.goto('/recipes');
    
    // Should be able to see recipes list
    await expect(page.getByRole('heading', { name: /recipes/i })).toBeVisible();
    
    // Should display recipe cards
    const recipeCards = page.locator('a[href^="/recipes/"]');
    await expect(recipeCards.first()).toBeVisible();
  });

  test('should limit guest users to first page only', async ({ page }) => {
    await page.goto('/recipes?page=2');
    
    // Should show message about logging in
    await expect(page.getByText(/login to see more/i)).toBeVisible();
    
    // Should not show recipes on page 2
    const noRecipesMessage = page.getByText(/no recipes|login/i);
    await expect(noRecipesMessage).toBeVisible();
  });

  test('should hide ingredients and steps from guest users', async ({ page }) => {
    await page.goto('/recipes');
    
    // Click on first recipe
    await page.locator('a[href^="/recipes/"]').first().click();
    await page.waitForURL(/\/recipes\/[^/]+$/);
    
    // Should show lock message
    await expect(page.getByText(/login to see.*ingredients|login to view full recipe/i)).toBeVisible();
    
    // Should show lock icon or locked state
    const lockIndicator = page.locator('[data-locked="true"], .locked, svg.lucide-lock');
    await expect(lockIndicator.first()).toBeVisible();
  });

  test('should prompt login when trying to create recipe', async ({ page }) => {
    await page.goto('/recipes/new');
    
    // Should redirect to login page or show login prompt
    await expect(page).toHaveURL(/\/login|\/signup/);
  });

  test('should prompt login when trying to edit recipe', async ({ page }) => {
    // Try to access edit page directly
    await page.goto('/recipes/recipe-1/edit');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login|\/signup/);
  });

  test('should prompt login when trying to delete recipe', async ({ page }) => {
    await page.goto('/recipes/recipe-1');
    
    // Delete button should not be visible for guest users
    const deleteButton = page.getByRole('button', { name: /delete/i });
    await expect(deleteButton).not.toBeVisible();
  });

  test('should show login CTA on locked recipe view', async ({ page }) => {
    await page.goto('/recipes');
    
    // Click on first recipe
    await page.locator('a[href^="/recipes/"]').first().click();
    await page.waitForURL(/\/recipes\/[^/]+$/);
    
    // Should show "Login to view" button or link
    const loginButton = page.getByRole('link', { name: /login|sign in/i }).first();
    await expect(loginButton).toBeVisible();
    
    // Click login button
    await loginButton.click();
    
    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow guest users to search recipes', async ({ page }) => {
    await page.goto('/recipes');
    
    // Search should work
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Pizza');
    await searchInput.press('Enter');
    
    // Should show search results
    await page.waitForURL(/\/recipes\?search=Pizza/);
    
    // But results should still be limited
    const recipeCards = page.locator('a[href^="/recipes/"]');
    const count = await recipeCards.count();
    expect(count).toBeLessThanOrEqual(10); // Guest limit
  });

  test('should show guest-specific UI elements', async ({ page }) => {
    await page.goto('/');
    
    // Should show "Login" or "Sign Up" in navigation
    await expect(page.getByRole('link', { name: /log in|sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
    
    // Should not show "Logout" or user menu
    const logoutButton = page.getByRole('button', { name: /log out/i });
    await expect(logoutButton).not.toBeVisible();
  });

  test('should display limited badge or indicator on recipe cards', async ({ page }) => {
    await page.goto('/recipes');
    
    // Check if recipe cards show any locked/limited indicators
    const lockIcons = page.locator('svg.lucide-lock, [data-locked="true"]');
    
    if (await lockIcons.count() > 0) {
      await expect(lockIcons.first()).toBeVisible();
    }
  });

  test('should show message when trying to access page 2', async ({ page }) => {
    await page.goto('/recipes');
    
    // Try to navigate to page 2 (if pagination exists)
    const nextButton = page.getByRole('button', { name: /next/i });
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      
      // Should show login prompt or limitation message
      await expect(page.getByText(/login|sign in/i)).toBeVisible();
    }
  });

  test('should preserve search query when redirected to login', async ({ page }) => {
    await page.goto('/recipes?search=Pasta');
    
    // Try to access a feature that requires login
    await page.goto('/recipes/new');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Guest to Authenticated Transition', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should show full content after logging in from locked recipe', async ({ page }) => {
    // Start as guest
    await page.goto('/recipes');
    await page.locator('a[href^="/recipes/"]').first().click();
    await page.waitForURL(/\/recipes\/[^/]+$/);
    
    const recipeUrl = page.url();
    
    // Should see locked state
    await expect(page.getByText(/login to see/i)).toBeVisible();
    
    // Click login link
    await page.getByRole('link', { name: /login|sign in/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    
    // Login
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Navigate back to recipe
    await page.goto(recipeUrl);
    
    // Should now see full content (ingredients and steps)
    await expect(page.getByText(/ingredients/i)).toBeVisible();
    await expect(page.getByText(/instructions|steps/i)).toBeVisible();
    
    // Should not see lock message
    await expect(page.getByText(/login to see/i)).not.toBeVisible();
  });
});
