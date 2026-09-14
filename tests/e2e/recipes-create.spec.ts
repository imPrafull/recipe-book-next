import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Recipe Creation Flow', () => {
  test('should navigate to new recipe page', async ({ page }) => {
    await page.goto('/recipes');
    
    // Click "New Recipe" button
    await page.getByRole('link', { name: /new recipe/i }).click();
    
    await expect(page).toHaveURL('/recipes/new');
    await expect(page.getByRole('heading', { name: /create recipe/i })).toBeVisible();
  });

  // TODO: Uncomment when image upload infrastructure is ready
  // test('should create recipe with all fields', async ({ page }) => {
  //   await page.goto('/recipes/new');
  //   
  //   // Fill in recipe form
  //   await page.getByLabel('Title').fill('Test E2E Recipe');
  //   await page.getByLabel('Description').fill('This is a test recipe created via Playwright');
  //   await page.getByLabel('Cooking Time').fill('45');
  //   
  //   // Add ingredients
  //   await page.getByRole('button', { name: /add ingredient/i }).click();
  //   await page.getByLabel(/ingredient name/i).first().fill('Test Ingredient');
  //   await page.getByLabel(/quantity/i).first().fill('2');
  //   await page.getByLabel(/unit/i).first().fill('cups');
  //   
  //   // Add steps
  //   await page.getByRole('button', { name: /add step/i }).click();
  //   await page.getByLabel(/step \d+/i).first().fill('This is the first test step');
  //   
  //   // Upload image
  //   const imagePath = path.join(__dirname, '..', 'fixtures', 'test-recipe-image.jpg');
  //   await page.getByLabel(/recipe image/i).setInputFiles(imagePath);
  //   
  //   // Submit form
  //   await page.getByRole('button', { name: /create recipe/i }).click();
  //   
  //   // Should redirect to recipe detail page
  //   await page.waitForURL(/\/recipes\/[^/]+$/);
  //   
  //   // Verify recipe was created
  //   await expect(page.getByRole('heading', { name: 'Test E2E Recipe' })).toBeVisible();
  //   await expect(page.getByText('This is a test recipe created via Playwright')).toBeVisible();
  //   await expect(page.getByText('45 min')).toBeVisible();
  // });

  test('should show validation errors when required fields are missing', async ({ page }) => {
    await page.goto('/recipes/new');
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create recipe/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/title.*required/i)).toBeVisible();
  });

  test('should allow adding multiple ingredients', async ({ page }) => {
    await page.goto('/recipes/new');
    
    // Add first ingredient
    await page.getByRole('button', { name: /add ingredient/i }).click();
    await page.getByLabel(/ingredient name/i).first().fill('Ingredient 1');
    
    // Add second ingredient
    await page.getByRole('button', { name: /add ingredient/i }).click();
    const ingredientInputs = page.getByLabel(/ingredient name/i);
    await ingredientInputs.nth(1).fill('Ingredient 2');
    
    // Verify both ingredients are present
    await expect(ingredientInputs).toHaveCount(2);
  });

  test('should allow adding multiple steps', async ({ page }) => {
    await page.goto('/recipes/new');
    
    // Add first step
    await page.getByRole('button', { name: /add step/i }).click();
    await page.getByLabel(/step 1/i).fill('First step');
    
    // Add second step
    await page.getByRole('button', { name: /add step/i }).click();
    await page.getByLabel(/step 2/i).fill('Second step');
    
    // Add third step
    await page.getByRole('button', { name: /add step/i }).click();
    await page.getByLabel(/step 3/i).fill('Third step');
    
    // Verify all steps are present
    const stepInputs = page.locator('[aria-label*="Step"]');
    await expect(stepInputs).toHaveCount(3);
  });

  test('should allow removing ingredients', async ({ page }) => {
    await page.goto('/recipes/new');
    
    // Add two ingredients
    await page.getByRole('button', { name: /add ingredient/i }).click();
    await page.getByRole('button', { name: /add ingredient/i }).click();
    
    // Remove first ingredient
    await page.getByRole('button', { name: /remove/i }).first().click();
    
    // Should have only one ingredient left
    const ingredientInputs = page.getByLabel(/ingredient name/i);
    await expect(ingredientInputs).toHaveCount(1);
  });

  // TODO: Uncomment when image upload infrastructure is ready
  // test('should preview uploaded image', async ({ page }) => {
  //   await page.goto('/recipes/new');
  //   
  //   // Upload image
  //   const imagePath = path.join(__dirname, '..', 'fixtures', 'test-recipe-image.jpg');
  //   await page.getByLabel(/recipe image/i).setInputFiles(imagePath);
  //   
  //   // Should show image preview
  //   const imagePreview = page.locator('img[alt*="preview" i]');
  //   await expect(imagePreview).toBeVisible();
  // });

  test('should allow canceling recipe creation', async ({ page }) => {
    await page.goto('/recipes/new');
    
    // Fill in some data
    await page.getByLabel('Title').fill('Cancelled Recipe');
    
    // Click cancel button
    await page.getByRole('link', { name: /cancel/i }).click();
    
    // Should navigate back to recipes list
    await expect(page).toHaveURL('/recipes');
  });
});

test.describe('Recipe Editing Flow', () => {
  let recipeId: string;

  test.beforeEach(async ({ page }) => {
    // Create a recipe to edit
    await page.goto('/recipes/new');
    await page.getByLabel('Title').fill('Recipe to Edit');
    await page.getByLabel('Description').fill('Original description');
    await page.getByLabel('Cooking Time').fill('30');
    await page.getByRole('button', { name: /create recipe/i }).click();
    
    // Wait for redirect and get recipe ID from URL
    await page.waitForURL(/\/recipes\/([^/]+)$/);
    const url = page.url();
    recipeId = url.split('/').pop() || '';
  });

  test('should navigate to edit page', async ({ page }) => {
    await page.goto(`/recipes/${recipeId}`);
    
    // Click edit button
    await page.getByRole('link', { name: /edit/i }).click();
    
    await expect(page).toHaveURL(`/recipes/${recipeId}/edit`);
    await expect(page.getByRole('heading', { name: /edit recipe/i })).toBeVisible();
  });

  test('should update recipe with new information', async ({ page }) => {
    await page.goto(`/recipes/${recipeId}/edit`);
    
    // Update fields
    await page.getByLabel('Title').fill('Updated Recipe Title');
    await page.getByLabel('Description').fill('Updated description');
    await page.getByLabel('Cooking Time').fill('45');
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should redirect to recipe detail page
    await page.waitForURL(`/recipes/${recipeId}`);
    
    // Verify updates
    await expect(page.getByRole('heading', { name: 'Updated Recipe Title' })).toBeVisible();
    await expect(page.getByText('Updated description')).toBeVisible();
    await expect(page.getByText('45 min')).toBeVisible();
  });
});
