import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Use unauthenticated state

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Should redirect to home page
    await page.waitForURL('/');
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');
    
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should successfully signup with new user', async ({ page }) => {
    await page.goto('/signup');
    
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should redirect to home page after successful signup
    await page.waitForURL('/');
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should show error when signing up with existing email', async ({ page }) => {
    await page.goto('/signup');
    
    await page.getByLabel('Name').fill('Duplicate User');
    await page.getByLabel('Email').fill('test@example.com'); // Existing user
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should show error message
    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test('should navigate from login to signup and vice versa', async ({ page }) => {
    await page.goto('/login');
    
    // Navigate to signup
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/signup');
    
    // Navigate back to login
    await page.getByRole('link', { name: /log in/i }).click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Logout Flow', () => {
  test('should successfully logout', async ({ page }) => {
    await page.goto('/');
    
    // Click user menu or logout button
    await page.getByRole('button', { name: /log out/i }).click();
    
    // Should redirect to login page or show guest state
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
  });
});
