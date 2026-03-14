import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { SIDEBAR_BREAKPOINT } from './helpers/viewport.js';

async function openSidebarIfMobile(page: Parameters<typeof test>[1]) {
  const vw = page.viewportSize()!.width;
  if (vw <= SIDEBAR_BREAKPOINT) {
    await page.locator('.mobile-menu-btn').click();
    await page.waitForSelector('.sidebar.open', { timeout: 3000 });
  }
}

test.describe('Theme switching', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('theme toggle button is visible in sidebar footer', async ({ page }) => {
    await openSidebarIfMobile(page);
    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await expect(themeBtn).toBeVisible();
  });

  test('theme toggle button has aria-label', async ({ page }) => {
    await openSidebarIfMobile(page);
    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await expect(themeBtn).toHaveAttribute('aria-label', 'Toggle theme');
  });

  test('clicking theme toggle changes data-theme attribute on html element', async ({ page }) => {
    await openSidebarIfMobile(page);

    // Get initial theme
    const initialTheme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme'),
    );

    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await themeBtn.click();

    // Theme should have changed
    const newTheme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme'),
    );

    expect(newTheme).not.toBeNull();
    expect(newTheme).not.toBe(initialTheme);
    expect(['light', 'dark']).toContain(newTheme);
  });

  test('clicking theme toggle twice restores original theme', async ({ page }) => {
    await openSidebarIfMobile(page);

    const initialTheme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme'),
    );

    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await themeBtn.click();
    await themeBtn.click();

    const restoredTheme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme'),
    );

    expect(restoredTheme).toBe(initialTheme);
  });

  test('switching to dark theme updates localStorage', async ({ page }) => {
    await openSidebarIfMobile(page);

    // Set known light state
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.reload();
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await openSidebarIfMobile(page);

    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await themeBtn.click();

    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('dark');
  });

  test('switching to light theme updates localStorage', async ({ page }) => {
    await openSidebarIfMobile(page);

    // Set known dark state
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.reload();
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await openSidebarIfMobile(page);

    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await themeBtn.click();

    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('light');
  });

  test('dark theme changes background color of the page', async ({ page }) => {
    await openSidebarIfMobile(page);

    // Force light theme first
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.reload();
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await openSidebarIfMobile(page);

    const lightBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(),
    );

    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await themeBtn.click();

    const darkBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(),
    );

    // Background color CSS variable should change
    expect(darkBg).not.toBe(lightBg);
  });

  test('theme persists after navigating to another page', async ({ page }) => {
    await openSidebarIfMobile(page);

    // Set to a known state
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.reload();
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await openSidebarIfMobile(page);

    // Switch theme
    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await themeBtn.click();

    const themeAfterToggle = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme'),
    );

    // Navigate to another page
    await page.goto('/writing/free');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    const themeAfterNav = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme'),
    );

    expect(themeAfterNav).toBe(themeAfterToggle);
  });

  test('theme toggle shows Moon icon in light mode', async ({ page }) => {
    await openSidebarIfMobile(page);

    // Ensure light theme
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.reload();
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await openSidebarIfMobile(page);

    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await expect(themeBtn).toBeVisible();
    // In light mode the button should have title text indicating switch to dark
    const title = await themeBtn.getAttribute('title');
    expect(title).toContain('dark');
  });

  test('theme toggle shows Sun icon in dark mode', async ({ page }) => {
    await openSidebarIfMobile(page);

    // Ensure dark theme
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.reload();
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await openSidebarIfMobile(page);

    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await expect(themeBtn).toBeVisible();
    const title = await themeBtn.getAttribute('title');
    expect(title).toContain('light');
  });
});

test.describe('Theme switching on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('theme toggle is accessible after opening mobile sidebar', async ({ page }) => {
    await page.locator('.mobile-menu-btn').click();
    await page.waitForSelector('.sidebar.open', { timeout: 3000 });

    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await expect(themeBtn).toBeVisible();
  });

  test('theme toggles correctly on mobile', async ({ page }) => {
    await page.locator('.mobile-menu-btn').click();
    await page.waitForSelector('.sidebar.open', { timeout: 3000 });

    const initialTheme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme'),
    );

    await page.locator('.sidebar-footer button[aria-label="Toggle theme"]').click();

    const newTheme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme'),
    );

    expect(newTheme).not.toBe(initialTheme);
    expect(['light', 'dark']).toContain(newTheme);
  });
});
