import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE } from './helpers/viewport.js';

// ── Vocabulary / Collocations page ────────────────────────────────────────────

test.describe('VocabularyPage (/vocabulary)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page renders without crashing', async ({ page }) => {
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
  });

  test('loading, error, or content state is shown', async ({ page }) => {
    await page.waitForTimeout(2000);
    const spinner = page.locator('.loading-state');
    const errorState = page.locator('.error-state');
    const cards = page.locator('.collocation-card');
    const emptyState = page.locator('.empty-state');
    const pageHeader = page.locator('.page-header, h1');

    const hasAny =
      (await spinner.count()) > 0 ||
      (await errorState.count()) > 0 ||
      (await cards.count()) > 0 ||
      (await emptyState.count()) > 0 ||
      (await pageHeader.count()) > 0;

    expect(hasAny).toBe(true);
  });

  test('filter bar / band filter buttons meet touch target', async ({ page }) => {
    await page.waitForTimeout(2000);
    const filterBtns = page.locator('.filter-chip, .filter-bar button');
    const count = await filterBtns.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await filterBtns.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('search input is visible and properly sized', async ({ page }) => {
    await page.waitForTimeout(2000);
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.count() === 0) return;

    await expect(searchInput).toBeVisible();
    const box = await searchInput.boundingBox();
    expect(box).not.toBeNull();
    // Input should be at least 100px wide and 44px tall
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('collocation cards fit within viewport', async ({ page }) => {
    await page.waitForTimeout(2000);
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.collocation-card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('collocation card phrase text has readable font size', async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator('.collocation-card');
    const count = await cards.count();
    if (count === 0) return;

    for (let i = 0; i < Math.min(count, 5); i++) {
      const phrases = cards.nth(i).locator('span, p').first();
      const fontSize = await phrases.evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('no horizontal scroll on vocabulary page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });
});

// ── Paraphrase page ───────────────────────────────────────────────────────────

test.describe('ParaphrasePage (/vocabulary/paraphrase)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary/paraphrase');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page renders without crashing', async ({ page }) => {
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
  });

  test('input fields are visible and sized correctly', async ({ page }) => {
    await page.waitForTimeout(2000);
    const inputs = page.locator('input, textarea');
    const count = await inputs.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await inputs.nth(i).boundingBox();
      if (!box) continue;
      const vw = page.viewportSize()!.width;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('action buttons meet touch target', async ({ page }) => {
    await page.waitForTimeout(2000);
    const buttons = page.locator('.btn');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('no horizontal scroll on paraphrase page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });
});

// ── Band Upgrades page ────────────────────────────────────────────────────────

test.describe('BandUpgradesPage (/vocabulary/upgrades)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary/upgrades');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page renders without crashing', async ({ page }) => {
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
  });

  test('content or empty state is shown', async ({ page }) => {
    await page.waitForTimeout(2000);
    const spinner = page.locator('.loading-state');
    const errorState = page.locator('.error-state');
    const emptyState = page.locator('.empty-state');
    const cards = page.locator('.card');
    const heading = page.locator('h1, h2, h3').first();

    const hasAny =
      (await spinner.count()) > 0 ||
      (await errorState.count()) > 0 ||
      (await emptyState.count()) > 0 ||
      (await cards.count()) > 0 ||
      (await heading.count()) > 0;

    expect(hasAny).toBe(true);
  });

  test('buttons meet touch target', async ({ page }) => {
    await page.waitForTimeout(2000);
    const buttons = page.locator('.btn');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('progress bars have visible height', async ({ page }) => {
    await page.waitForTimeout(2000);
    const bars = page.locator('.score-bar-track, .progress-bar, [class*="bar-track"]');
    const count = await bars.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await bars.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(4);
    }
  });

  test('no horizontal scroll on band upgrades page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('band upgrade text is readable (min font size)', async ({ page }) => {
    await page.waitForTimeout(2000);
    const textElements = page.locator('.card p, .card span, .card div').first();
    if (await textElements.count() === 0) return;

    const fontSize = await textElements.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });
});
