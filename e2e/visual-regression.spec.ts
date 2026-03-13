import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { clearAuth } from './helpers/auth.js';

// Screenshot options shared across all tests
const SCREENSHOT_OPTIONS = {
  maxDiffPixelRatio: 0.002, // 0.2% threshold
  animations: 'disabled' as const,
};

// Pages that require authentication
const PROTECTED_PAGES = [
  { route: '/', name: 'dashboard' },
  { route: '/writing/task2', name: 'writing-task2' },
  { route: '/writing/free', name: 'writing-free' },
  { route: '/writing/history', name: 'writing-history' },
  { route: '/skills', name: 'skills' },
  { route: '/vocabulary', name: 'vocabulary' },
  { route: '/vocabulary/paraphrase', name: 'vocabulary-paraphrase' },
  { route: '/vocabulary/upgrades', name: 'vocabulary-upgrades' },
  { route: '/daily-challenge', name: 'daily-challenge' },
  { route: '/analytics', name: 'analytics' },
];

// ── Login page screenshots ────────────────────────────────────────────────────

test.describe('Visual regression — login page', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('login page matches screenshot', async ({ page }) => {
    await page.goto('/login');
    // Wait for any animations to settle
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('login-page.png', SCREENSHOT_OPTIONS);
  });
});

// ── Protected page screenshots ────────────────────────────────────────────────

test.describe('Visual regression — protected pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  for (const { route, name } of PROTECTED_PAGES) {
    test(`${route} matches screenshot`, async ({ page }) => {
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      // Allow data fetching/loading states to settle
      await page.waitForTimeout(1500);
      // Hide any animated elements that would cause flakiness
      await page.evaluate(() => {
        // Stop CSS animations
        const style = document.createElement('style');
        style.textContent = '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
        document.head.appendChild(style);
      });
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot(`${name}.png`, SCREENSHOT_OPTIONS);
    });
  }
});
