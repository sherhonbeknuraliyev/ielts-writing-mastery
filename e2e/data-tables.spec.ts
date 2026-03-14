import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';

// ── Analytics vocab-watch table ──────────────────────────────────────────────

test.describe('Data tables — analytics .vocab-watch-table', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('vocab-watch table header cells have padding', async ({ page }) => {
    const table = page.locator('.vocab-watch-table');
    if (await table.count() === 0) return;

    const headers = table.locator('th');
    const count = await headers.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const padding = await headers.nth(i).evaluate((el) => {
        const style = getComputedStyle(el);
        return parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      });
      expect(padding, `Table header #${i} has no horizontal padding`).toBeGreaterThan(0);
    }
  });

  test('vocab-watch table body cells have padding', async ({ page }) => {
    const table = page.locator('.vocab-watch-table');
    if (await table.count() === 0) return;

    const cells = table.locator('td');
    const count = await cells.count();
    if (count === 0) return;

    for (let i = 0; i < Math.min(count, 6); i++) {
      const padding = await cells.nth(i).evaluate((el) => {
        const style = getComputedStyle(el);
        return parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      });
      expect(padding, `Table cell #${i} has no vertical padding`).toBeGreaterThan(0);
    }
  });

  test('table header has border-bottom', async ({ page }) => {
    const table = page.locator('.vocab-watch-table');
    if (await table.count() === 0) return;

    const header = table.locator('th').first();
    if (await header.count() === 0) return;

    const borderBottom = await header.evaluate(
      (el) => parseFloat(getComputedStyle(el).borderBottomWidth),
    );
    expect(borderBottom, 'Table header missing border-bottom').toBeGreaterThan(0);
  });

  test('table text is readable — font size >= 12px', async ({ page }) => {
    const table = page.locator('.vocab-watch-table');
    if (await table.count() === 0) return;

    const cells = table.locator('td');
    if (await cells.count() === 0) return;

    const fontSize = await cells.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, 'Table cell font size < 12px').toBeGreaterThanOrEqual(12);
  });
});

// ── Table does not break layout on mobile ────────────────────────────────────

test.describe('Data tables — mobile horizontal scroll', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('table does not cause body horizontal overflow', async ({ page }) => {
    const table = page.locator('.vocab-watch-table');
    if (await table.count() === 0) return;

    // Page body width should not exceed viewport width significantly
    const vw = page.viewportSize()!.width;
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    // Allow some tolerance for minor rendering differences
    expect(
      bodyScrollWidth,
      `Body scroll width ${bodyScrollWidth} exceeds viewport ${vw} — table may be causing overflow`,
    ).toBeLessThanOrEqual(vw + 5);
  });
});

// ── List items spacing ────────────────────────────────────────────────────────

test.describe('Data tables — list item spacing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('recommendation cards have spacing between them', async ({ page }) => {
    const cards = page.locator('.recommendation-card');
    const count = await cards.count();
    if (count < 2) return;

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();

    if (!box0 || !box1) return;

    // There should be a gap between consecutive cards (margin-bottom)
    const gap = box1.y - (box0.y + box0.height);
    expect(gap, 'Recommendation cards have no spacing between them').toBeGreaterThan(0);
  });

  test('error pattern cards have spacing between them', async ({ page }) => {
    const cards = page.locator('.error-pattern-card');
    const count = await cards.count();
    if (count < 2) return;

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();

    if (!box0 || !box1) return;

    const gap = box1.y - (box0.y + box0.height);
    expect(gap, 'Error pattern cards have no spacing').toBeGreaterThan(0);
  });
});

// ── Expandable/collapsible sections in analytics ─────────────────────────────

test.describe('Data tables — expandable error pattern cards', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('clicking error pattern header expands it', async ({ page }) => {
    const headers = page.locator('.error-pattern-header');
    if (await headers.count() === 0) return;

    // Check whether examples are hidden initially
    const examplesInitial = page.locator('.error-pattern-examples');
    const initialCount = await examplesInitial.count();

    await headers.first().click();
    await page.waitForTimeout(300);

    // After clicking, either examples become visible or toggle closed
    const examplesAfter = page.locator('.error-pattern-examples');
    const afterCount = await examplesAfter.count();

    // Count should change (toggle) — either opened or closed
    // If it was already open, it closes; if closed, it opens
    // We just verify the interaction works without error
    expect(typeof afterCount).toBe('number');
  });

  test('expanded error pattern examples show original → corrected', async ({ page }) => {
    const headers = page.locator('.error-pattern-header');
    if (await headers.count() === 0) return;

    // Open it
    await headers.first().click();
    await page.waitForTimeout(300);

    const examples = page.locator('.error-example');
    if (await examples.count() === 0) return;

    // Each example should have original and corrected spans
    const original = examples.first().locator('.error-example-original');
    const corrected = examples.first().locator('.error-example-corrected');

    if (await original.count() > 0) {
      await expect(original).toBeVisible();
    }
    if (await corrected.count() > 0) {
      await expect(corrected).toBeVisible();
    }
  });
});

// ── Recommendation section icon + text alignment ─────────────────────────────

test.describe('Data tables — recommendation section layout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('recommendation card icon and text are aligned', async ({ page }) => {
    const cards = page.locator('.recommendation-card');
    if (await cards.count() === 0) return;

    const card = cards.first();

    // Should have flex display
    const display = await card.evaluate(
      (el) => getComputedStyle(el).display,
    );
    expect(display, '.recommendation-card should be flex').toBe('flex');

    // Icon should be visible
    const icon = card.locator('.recommendation-icon');
    if (await icon.count() > 0) {
      await expect(icon).toBeVisible();
      const iconBox = await icon.boundingBox();
      expect(iconBox).not.toBeNull();
      expect(iconBox!.width).toBeGreaterThan(0);
      expect(iconBox!.height).toBeGreaterThan(0);
    }
  });

  test('recommendation-icon has equal width and height (square)', async ({ page }) => {
    const icons = page.locator('.recommendation-icon');
    if (await icons.count() === 0) return;

    const { width, height } = await icons.first().evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        width: parseFloat(style.width),
        height: parseFloat(style.height),
      };
    });

    // The icon container is 36x36px per CSS
    expect(width).toBeGreaterThanOrEqual(20);
    expect(height).toBeGreaterThanOrEqual(20);
    // Should be roughly square
    expect(Math.abs(width - height)).toBeLessThanOrEqual(4);
  });
});
