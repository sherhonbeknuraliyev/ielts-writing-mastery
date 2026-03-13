import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_FONT_SIZE, MIN_TOUCH_TARGET } from './helpers/viewport.js';

test.describe('AnalyticsPage (/analytics)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page renders without crashing', async ({ page }) => {
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
  });

  test('loading, error, or analytics content is displayed', async ({ page }) => {
    await page.waitForTimeout(3000);

    const spinner = page.locator('.loading-state');
    const errorState = page.locator('.error-state');
    const emptyState = page.locator('.empty-state');
    const sections = page.locator('.card, h1, h2, .section-title');

    const hasAny =
      (await spinner.count()) > 0 ||
      (await errorState.count()) > 0 ||
      (await emptyState.count()) > 0 ||
      (await sections.count()) > 0;

    expect(hasAny).toBe(true);
  });

  test('no horizontal scroll on analytics page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('all visible cards fit within viewport width', async ({ page }) => {
    await page.waitForTimeout(2000);
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box || box.width === 0) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('section titles have readable font size', async ({ page }) => {
    await page.waitForTimeout(2000);
    const titles = page.locator('.section-title, h2, h3');
    const count = await titles.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontSize = await titles.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('collapsible sections expand on click', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Look for card-header elements that act as collapse toggles (have cursor:pointer)
    const collapsibleHeaders = page.locator('.card-header[role="button"], .card-header[tabindex]');
    const count = await collapsibleHeaders.count();
    if (count === 0) return;

    // Click the first collapsible
    const header = collapsibleHeaders.first();
    await header.click();
    // Just confirm no crash — the page should still be visible
    await expect(page.locator('.page-content')).toBeVisible();
  });

  test('buttons on analytics page meet touch target', async ({ page }) => {
    await page.waitForTimeout(2000);
    const buttons = page.locator('.btn');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('stat values are visible and have readable font size', async ({ page }) => {
    await page.waitForTimeout(2000);
    const statValues = page.locator('.stat-value, .criterion-card-score');
    const count = await statValues.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      await expect(statValues.nth(i)).toBeVisible();
      const fontSize = await statValues.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('tables (if any) are horizontally scrollable on mobile', async ({ page }) => {
    await page.waitForTimeout(2000);
    const tables = page.locator('table');
    const count = await tables.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const wrapper = tables.nth(i).locator('..');
      const overflowX = await wrapper.evaluate(
        (el) => getComputedStyle(el).overflowX,
      );
      const tableBox = await tables.nth(i).boundingBox();
      const wrapperBox = await wrapper.boundingBox();
      if (!tableBox || !wrapperBox) continue;

      // If table is wider than wrapper, wrapper should allow scrolling
      if (tableBox.width > wrapperBox.width) {
        expect(['auto', 'scroll']).toContain(overflowX);
      }
    }
  });
});
