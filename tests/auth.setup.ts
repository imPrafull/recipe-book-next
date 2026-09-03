import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login');

  // Fill in login form
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');

  // Click login button
  await page.getByRole('button', { name: /log in/i }).click();

  // Wait for navigation to home page or successful login indication
  await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

  // Verify login was successful (check for user-specific element)
  await expect(page.getByRole('navigation')).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
