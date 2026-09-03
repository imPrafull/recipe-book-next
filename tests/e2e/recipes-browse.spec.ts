import { test, expect } from '@playwright/test';

test.describe('Recipe Browsing', () => {
  test('should display recipes list page', async ({ page }) => {
    await page.goto('/recipes');
    
    await expect(page.getByRole('heading', { name: /recipes/i })).toBeVisible();
    
    // Should display recipe cards
    const recipeCards = page.locator('[data-testid="recipe-card"], article, .recipe-card').first();
    await expect(recipeCards).toBeVisible();
  });

  test('should display recipe details', async ({ page }) => {
    await page.goto('/recipes');
    
    // Click on first recipe card
    const firstRecipe = page.locator('a[href^="/recipes/"]').first();
    await firstRecipe.click();
    
    // Should navigate to recipe detail page
    await page.waitForURL(/\/recipes\/[^/]+$/);
    
    // Should display recipe details
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/cooking time/i)).toBeVisible();
  });

  test('should show ingredients and steps for authenticated users', async ({ page }) => {
    await page.goto('/recipes');
    
    // Click on first recipe
    await page.locator('a[href^="/recipes/"]').first().click();
    await page.waitForURL(/\/recipes\/[^/]+$/);
    
    // Should show ingredients section
    await expect(page.getByText(/ingredients/i)).toBeVisible();
    
    // Should show steps section
    await expect(page.getByText(/instructions|steps/i)).toBeVisible();
  });

  test('should allow searching for recipes', async ({ page }) => {
    await page.goto('/recipes');
    
    // Find search input
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Pizza');
    await searchInput.press('Enter');
    
    // Should show search results
    await page.waitForURL(/\/recipes\?search=Pizza/);
    
    // Results should contain the search term
    const recipeTitle = page.locator('h2, h3').first();
    await expect(recipeTitle).toContainText('Pizza', { ignoreCase: true });
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/recipes');
    
    // Check if pagination controls exist
    const nextButton = page.getByRole('button', { name: /next/i });
    
    if (await nextButton.isVisible()) {
      // Click next page
      await nextButton.click();
      
      // URL should update with page parameter
      await expect(page).toHaveURL(/[?&]page=2/);
      
      // Should still show recipe cards
      const recipeCards = page.locator('a[href^="/recipes/"]');
      await expect(recipeCards.first()).toBeVisible();
    }
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/recipes?page=2');
    
    // Go back to page 1
    const prevButton = page.getByRole('button', { name: /prev|previous/i });
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await expect(page).toHaveURL(/[?&]page=1/);
    }
  });

  test('should display empty state for no search results', async ({ page }) => {
    await page.goto('/recipes');
    
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('NonexistentRecipe123456789');
    await searchInput.press('Enter');
    
    // Should show no results message
    await expect(page.getByText(/no recipes found|no results/i)).toBeVisible();
  });

  test('should filter recipes by category', async ({ page }) => {
    await page.goto('/recipes');
    
    // Check if category filters exist
    const categoryButton = page.getByRole('button', { name: /breakfast|lunch|dinner/i }).first();
    
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      
      // Should filter recipes
      await page.waitForLoadState('networkidle');
      
      // Recipe cards should still be visible
      const recipeCards = page.locator('a[href^="/recipes/"]');
      await expect(recipeCards.first()).toBeVisible();
    }
  });

  test('should display recipe metadata', async ({ page }) => {
    await page.goto('/recipes');
    
    // Click on first recipe
    await page.locator('a[href^="/recipes/"]').first().click();
    await page.waitForURL(/\/recipes\/[^/]+$/);
    
    // Should display cooking time
    await expect(page.getByText(/\d+\s*(min|minutes)/i)).toBeVisible();
    
    // Should display creation date
    const dateRegex = /\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i;
    await expect(page.locator(`text=${dateRegex}`).first()).toBeVisible();
  });
});

test.describe('Recipe Actions for Authenticated Users', () => {
  test('should allow deleting own recipe', async ({ page }) => {
    // First create a recipe
    await page.goto('/recipes/new');
    await page.getByLabel('Title').fill('Recipe to Delete');
    await page.getByLabel('Description').fill('This will be deleted');
    await page.getByLabel('Cooking Time').fill('20');
    await page.getByRole('button', { name: /create recipe/i }).click();
    
    // Wait for redirect
    await page.waitForURL(/\/recipes\/[^/]+$/);
    const recipeUrl = page.url();
    
    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();
    
    // Should redirect to recipes list
    await expect(page).toHaveURL('/recipes');
    
    // Verify recipe is deleted by trying to access it
    await page.goto(recipeUrl);
    await expect(page.getByText(/not found|doesn't exist/i)).toBeVisible();
  });

  test('should allow favoriting recipes', async ({ page }) => {
    await page.goto('/recipes');
    
    // Click favorite button on first recipe card
    const favoriteButton = page.getByRole('button', { name: /favorite|heart/i }).first();
    await favoriteButton.click();
    
    // Button should change state (filled heart)
    await expect(favoriteButton).toHaveClass(/favorite|active/);
  });
});

test.describe('Recipe Navigation', () => {
  test('should navigate from home to recipes', async ({ page }) => {
    await page.goto('/');
    
    // Click on "Browse Recipes" or similar link
    await page.getByRole('link', { name: /recipes|browse/i }).click();
    
    await expect(page).toHaveURL('/recipes');
  });

  test('should navigate back to recipes list from detail page', async ({ page }) => {
    await page.goto('/recipes');
    
    // Click on first recipe
    await page.locator('a[href^="/recipes/"]').first().click();
    await page.waitForURL(/\/recipes\/[^/]+$/);
    
    // Click back to recipes list
    await page.getByRole('link', { name: /back|recipes/i }).click();
    
    await expect(page).toHaveURL('/recipes');
  });
});
