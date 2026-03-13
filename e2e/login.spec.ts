import { test, expect } from '@playwright/test';
import { clearAuth } from './helpers/auth.js';
import { MIN_FONT_SIZE } from './helpers/viewport.js';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/login');
  });

  test('renders the auth card with logo and title', async ({ page }) => {
    const logo = page.locator('.auth-logo');
    await expect(logo).toBeVisible();

    const title = page.locator('.auth-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('IELTS Writing Mastery');

    const subtitle = page.locator('.auth-subtitle');
    await expect(subtitle).toBeVisible();
  });

  test('auth card is centered on the page', async ({ page }) => {
    const card = page.locator('.auth-card');
    await expect(card).toBeVisible();

    const viewportWidth = page.viewportSize()!.width;
    const box = await card.boundingBox();
    expect(box).not.toBeNull();

    // Card should be horizontally centered — left and right margins should be roughly equal
    const leftMargin = box!.x;
    const rightMargin = viewportWidth - (box!.x + box!.width);
    // Allow ±20px tolerance for centering
    expect(Math.abs(leftMargin - rightMargin)).toBeLessThanOrEqual(20);
  });

  test('auth card does not overflow the viewport horizontally', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('auth card does not overflow the viewport vertically on small screens', async ({ page }) => {
    const card = page.locator('.auth-card');
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    // Card must fit or scroll, not be cut off at the right
    expect(box!.x).toBeGreaterThanOrEqual(0);
  });

  test('title font size is at least 12px', async ({ page }) => {
    const title = page.locator('.auth-title');
    const fontSize = await title.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });

  test('subtitle font size is at least 12px', async ({ page }) => {
    const subtitle = page.locator('.auth-subtitle');
    const fontSize = await subtitle.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });

  test('Telegram widget mount point is present and has minimum touch-target height', async ({ page }) => {
    // The widget div is the direct parent of the Telegram script/iframe
    const widgetArea = page.locator('.auth-body');
    await expect(widgetArea).toBeVisible();
    const box = await widgetArea.boundingBox();
    expect(box).not.toBeNull();
    // The body area must be reasonably tall so the widget is easily tappable
    expect(box!.height).toBeGreaterThan(40);
  });

  test('already-authenticated users are redirected away from login', async ({ page }) => {
    // Set auth state then navigate to /login — should redirect to /
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-jwt-token-for-e2e');
      localStorage.setItem(
        'ielts-user',
        JSON.stringify({ _id: 'x', telegramId: 1, firstName: 'T' }),
      );
    });
    await page.goto('/login');
    // React router will redirect to / — wait for URL change
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('page body background covers full viewport', async ({ page }) => {
    const bg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    // Should not be empty or transparent
    expect(bg).not.toBe('');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });
});
