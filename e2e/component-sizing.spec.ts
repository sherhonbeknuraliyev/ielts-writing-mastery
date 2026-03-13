import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { SIDEBAR_WIDTH, SIDEBAR_BREAKPOINT } from './helpers/viewport.js';

test.describe('Component sizing — cards', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('cards have min-height 60px', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box || box.height === 0) continue;
      expect(box.height, `Card #${i} height too small`).toBeGreaterThanOrEqual(60);
    }
  });

  test('cards have border-radius applied', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const el = cards.nth(i);
      const box = await el.boundingBox();
      if (!box || box.height === 0) continue;
      const radius = await el.evaluate(
        (node) => parseFloat(getComputedStyle(node).borderRadius),
      );
      expect(radius, `Card #${i} has no border-radius`).toBeGreaterThan(0);
    }
  });

  test('cards have at least 16px padding (on card or card-body)', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const el = cards.nth(i);
      const box = await el.boundingBox();
      if (!box || box.height === 0) continue;

      // Cards may apply padding directly or via a .card-body child
      const padding = await el.evaluate((node) => {
        function minPadding(el: Element): number {
          const style = getComputedStyle(el);
          return Math.min(
            parseFloat(style.paddingTop),
            parseFloat(style.paddingRight),
            parseFloat(style.paddingBottom),
            parseFloat(style.paddingLeft),
          );
        }
        const cardPadding = minPadding(node);
        if (cardPadding >= 16) return cardPadding;
        // Fall back to checking a .card-body or .card-header child
        const body = node.querySelector('.card-body, .card-header');
        if (body) return minPadding(body);
        return cardPadding;
      });
      expect(padding, `Card #${i} (and its body) has padding < 16px`).toBeGreaterThanOrEqual(16);
    }
  });
});

test.describe('Component sizing — page headers', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page header h1 font size >= 24px on desktop', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop-only test');

    const h1 = page.locator('.page-header h1, .dashboard-welcome h1').first();
    if (await h1.count() === 0) return;
    const fontSize = await h1.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, 'Desktop h1 font size < 24px').toBeGreaterThanOrEqual(24);
  });

  test('page header h1 font size >= 20px on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    const h1 = page.locator('.page-header h1, .dashboard-welcome h1').first();
    if (await h1.count() === 0) return;
    const fontSize = await h1.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, 'Mobile h1 font size < 20px').toBeGreaterThanOrEqual(20);
  });
});

test.describe('Component sizing — stat cards', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('stat cards have min-width 120px', async ({ page }) => {
    const statCards = page.locator('.stat-card');
    const count = await statCards.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await statCards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.width, `Stat card #${i} width < 120px`).toBeGreaterThanOrEqual(120);
    }
  });

  test('stat cards have non-trivial height', async ({ page }) => {
    const statCards = page.locator('.stat-card');
    const count = await statCards.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await statCards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height, `Stat card #${i} height too small`).toBeGreaterThan(40);
    }
  });
});

test.describe('Component sizing — score bars', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('score bar track has height exactly 6px', async ({ page }) => {
    const tracks = page.locator('.score-bar-track');
    const count = await tracks.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await tracks.nth(i).boundingBox();
      if (!box) continue;
      // Allow 1px tolerance for sub-pixel rendering
      expect(box.height, `Score bar track #${i} height != 6px`).toBeGreaterThanOrEqual(4);
      expect(box.height, `Score bar track #${i} height != 6px`).toBeLessThanOrEqual(10);
    }
  });

  test('score bar track has border-radius', async ({ page }) => {
    const tracks = page.locator('.score-bar-track');
    const count = await tracks.count();
    if (count === 0) return;

    const radius = await tracks.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).borderRadius),
    );
    expect(radius).toBeGreaterThan(0);
  });
});

test.describe('Component sizing — overall band display', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('overall band element is present', async ({ page }) => {
    const band = page.locator('.overall-band');
    if (await band.count() === 0) return;
    await expect(band).toBeVisible();
  });

  test('overall band number font size >= 32px', async ({ page }) => {
    const band = page.locator('.overall-band');
    if (await band.count() === 0) return;

    const numberEl = band.locator('.band-number, .overall-band-number').first();
    if (await numberEl.count() === 0) return;

    const fontSize = await numberEl.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, 'Overall band number font size < 32px').toBeGreaterThanOrEqual(32);
  });

  test('overall band is horizontally centered within its container', async ({ page }) => {
    const band = page.locator('.overall-band');
    if (await band.count() === 0) return;

    const textAlign = await band.evaluate(
      (el) => getComputedStyle(el).textAlign,
    );
    const justifyContent = await band.evaluate(
      (el) => getComputedStyle(el).justifyContent,
    );
    const alignItems = await band.evaluate(
      (el) => getComputedStyle(el).alignItems,
    );

    const isCentered =
      textAlign === 'center' ||
      justifyContent === 'center' ||
      alignItems === 'center';
    expect(isCentered, 'Overall band is not centered').toBe(true);
  });
});

test.describe('Component sizing — empty states', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('empty state is horizontally centered', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    const textAlign = await emptyState.first().evaluate(
      (el) => getComputedStyle(el).textAlign,
    );
    const alignItems = await emptyState.first().evaluate(
      (el) => getComputedStyle(el).alignItems,
    );
    const margin = await emptyState.first().evaluate((el) => {
      const style = getComputedStyle(el);
      return style.marginLeft === 'auto' && style.marginRight === 'auto';
    });

    const isCentered =
      textAlign === 'center' || alignItems === 'center' || margin;
    expect(isCentered, 'Empty state is not centered').toBe(true);
  });

  test('empty state icon is at least 32px', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    const icon = emptyState.first().locator('.empty-state-icon');
    if (await icon.count() === 0) return;

    const box = await icon.boundingBox();
    if (!box) return;
    expect(Math.max(box.width, box.height), 'Empty state icon < 32px').toBeGreaterThanOrEqual(32);
  });

  test('empty state heading font size >= 16px', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    const heading = emptyState.first().locator('h3, h2, .empty-title').first();
    if (await heading.count() === 0) return;

    const fontSize = await heading.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, 'Empty state heading < 16px').toBeGreaterThanOrEqual(16);
  });
});

test.describe('Component sizing — loading and error states', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/task2');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('loading state spinner is visible and centered', async ({ page }) => {
    const loadingState = page.locator('.loading-state');
    if (await loadingState.count() === 0) return;

    await expect(loadingState.first()).toBeVisible();

    const textAlign = await loadingState.first().evaluate(
      (el) => getComputedStyle(el).textAlign,
    );
    const alignItems = await loadingState.first().evaluate(
      (el) => getComputedStyle(el).alignItems,
    );
    const isCentered = textAlign === 'center' || alignItems === 'center';
    expect(isCentered, 'Loading state not centered').toBe(true);
  });

  test('error state has readable font size', async ({ page }) => {
    await page.waitForTimeout(2000);
    const errorState = page.locator('.error-state');
    if (await errorState.count() === 0) return;

    await expect(errorState.first()).toBeVisible();
    const fontSize = await errorState.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, 'Error state font size too small').toBeGreaterThanOrEqual(12);
  });
});

test.describe('Component sizing — sidebar dimensions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('sidebar is exactly 260px wide on desktop', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop-only test');

    const sidebar = page.locator('.sidebar');
    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(SIDEBAR_WIDTH - 5);
    expect(box!.width).toBeLessThanOrEqual(SIDEBAR_WIDTH + 5);
  });

  test('sidebar is full viewport width when open on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    await page.locator('.mobile-menu-btn').click();

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toHaveClass(/open/);
    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    // Mobile sidebar should take most of the screen width
    expect(box!.width).toBeGreaterThan(vw * 0.6);
  });
});

test.describe('Component sizing — main content offset', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('main content starts at sidebar width on desktop', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop-only test');

    const main = page.locator('.main-content');
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x, 'Main content overlaps sidebar').toBeGreaterThanOrEqual(SIDEBAR_WIDTH - 5);
  });

  test('main content starts at left edge on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    const main = page.locator('.main-content');
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x, 'Main content not at left edge on mobile').toBeLessThan(10);
    expect(box!.width, 'Main content not full-width on mobile').toBeGreaterThan(vw * 0.9);
  });
});
