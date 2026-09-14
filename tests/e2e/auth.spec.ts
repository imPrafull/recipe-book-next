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
    
    // Should store tokens in localStorage
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    const tokenExpiresAt = await page.evaluate(() => localStorage.getItem('tokenExpiresAt'));
    
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    expect(tokenExpiresAt).toBeTruthy();
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
    
    // Should store tokens in localStorage after signup
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    const tokenExpiresAt = await page.evaluate(() => localStorage.getItem('tokenExpiresAt'));
    
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    expect(tokenExpiresAt).toBeTruthy();
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
    // First login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('/');
    
    // Verify tokens are stored
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeTruthy();
    
    // Click logout button
    await page.getByRole('button', { name: /log out/i }).click();
    
    // Should redirect to login page or show guest state
    await page.waitForURL('/');
    
    // Should clear tokens from localStorage
    const clearedAccessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const clearedRefreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    const clearedTokenExpiresAt = await page.evaluate(() => localStorage.getItem('tokenExpiresAt'));
    
    expect(clearedAccessToken).toBeNull();
    expect(clearedRefreshToken).toBeNull();
    expect(clearedTokenExpiresAt).toBeNull();
  });
});

test.describe('Token Persistence and Refresh', () => {
  test('should remain logged in after page reload with valid token', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('/');
    
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeTruthy();
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    await expect(page.getByRole('navigation')).toBeVisible();
    const reloadedAccessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(reloadedAccessToken).toBeTruthy();
  });

  test('should restore session with expired token on page load', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('/');
    
    // Store the refresh token
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(refreshToken).toBeTruthy();
    
    // Simulate token expiry by setting tokenExpiresAt to past time
    await page.evaluate(() => {
      localStorage.setItem('tokenExpiresAt', (Date.now() - 60000).toString());
    });
    
    // Reload page - should trigger proactive refresh
    await page.reload();
    
    // Should be back to authenticated state with new token
    await expect(page.getByRole('navigation')).toBeVisible();
    const newAccessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(newAccessToken).toBeTruthy();
  });

  test('should have valid token expiry time stored after login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('/');
    
    const tokenExpiresAt = await page.evaluate(() => {
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      return expiresAt ? parseInt(expiresAt, 10) : null;
    });
    
    // Token should expire in the future (within 15 minutes)
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    
    expect(tokenExpiresAt).toBeTruthy();
    expect(tokenExpiresAt).toBeGreaterThan(now);
    expect(tokenExpiresAt).toBeLessThan(now + fifteenMinutes + 10000); // 10s buffer for execution
  });
});

test.describe('Guest Mode', () => {
  test('should access recipes page without authentication (guest mode)', async ({ page }) => {
    // Go to recipes without logging in
    await page.goto('/recipes');
    
    // Should display recipes with limited data
    await expect(page.getByRole('heading', { name: /recipes/i })).toBeVisible();
    
    // No access token should be present
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeNull();
  });

  test('should show login prompt for authenticated features', async ({ page }) => {
    // Go to create recipe page without authentication
    await page.goto('/recipes/new');
    
    // Should be redirected to login or show auth modal
    // (depending on implementation)
    await expect(page.getByText(/log in|sign up|authentication/i)).toBeVisible();
  });
});

