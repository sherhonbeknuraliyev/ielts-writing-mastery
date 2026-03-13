import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE } from './helpers/viewport.js';

test.describe('Dashboard page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  // ── Welcome section ───────────────────────────────────────────────────

  test('welcome heading is visible and contains user name', async ({ page }) => {
    const welcome = page.locator('.dashboard-welcome h1');
    await expect(welcome).toBeVisible();
    await expect(welcome).toContainText('Test');
  });

  test('welcome subtext is visible', async ({ page }) => {
    const subtext = page.locator('.dashboard-welcome p');
    await expect(subtext).toBeVisible();
  });

  test('quick action buttons are visible', async ({ page }) => {
    const buttons = page.locator('.quick-action-btn');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('quick action buttons meet minimum touch target', async ({ page }) => {
    const buttons = page.locator('.quick-action-btn');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('primary quick action button has distinct styling', async ({ page }) => {
    const primaryBtn = page.locator('.quick-action-btn.primary');
    await expect(primaryBtn).toBeVisible();
  });

  // ── Stat cards ────────────────────────────────────────────────────────

  test('stat cards are rendered', async ({ page }) => {
    const cards = page.locator('.stat-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('stat cards have non-zero height', async ({ page }) => {
    const cards = page.locator('.stat-card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThan(40);
    }
  });

  test('stat card labels have readable font size', async ({ page }) => {
    const labels = page.locator('.stat-label');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const fontSize = await labels.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('stat card values are visible', async ({ page }) => {
    const values = page.locator('.stat-value');
    const count = await values.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(values.nth(i)).toBeVisible();
    }
  });

  // ── Grid layout at different viewports ───────────────────────────────

  test('stat cards are stacked in a single column on small mobile (320px)', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > 400, 'Small-mobile-only test');

    const cards = page.locator('.stat-card');
    const count = await cards.count();
    if (count < 2) return;

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    if (!box0 || !box1) return;

    // On small screens cards should stack (second card is below first)
    expect(box1.y).toBeGreaterThanOrEqual(box0.y + box0.height - 2);
  });

  test('stat cards fit within the viewport width', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.stat-card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
      expect(box.x).toBeGreaterThanOrEqual(-1);
    }
  });

  // ── Section title ─────────────────────────────────────────────────────

  test('Recent Writings section title is visible', async ({ page }) => {
    const sectionTitle = page.locator('.section-title', { hasText: 'Recent Writings' });
    await expect(sectionTitle).toBeVisible();
  });

  // ── Empty state ───────────────────────────────────────────────────────

  test('empty state shows when no writings — has CTA button', async ({ page }) => {
    // With a fake token the API will fail/return empty — expect empty state or writings
    const emptyState = page.locator('.empty-state');
    const writingCards = page.locator('.grid-auto .card');

    const hasEmpty = await emptyState.count() > 0;
    const hasCards = await writingCards.count() > 0;

    // One of them must be present
    expect(hasEmpty || hasCards).toBe(true);

    if (hasEmpty) {
      const ctaBtn = emptyState.locator('.btn-primary');
      await expect(ctaBtn).toBeVisible();
      const box = await ctaBtn.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('empty state icon is visible when present', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    const icon = emptyState.locator('.empty-state-icon');
    await expect(icon).toBeVisible();
  });

  // ── Band descriptor section ───────────────────────────────────────────

  test('Band Descriptor Reference card is visible and collapsible', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await expect(header).toBeVisible();

    // Click to expand
    await header.click();

    // After expanding, descriptor blocks should appear
    const blocks = page.locator('.descriptor-block');
    await expect(blocks.first()).toBeVisible({ timeout: 3000 });
  });

  test('collapsed Band Descriptor has show/hide toggle text', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await expect(header).toBeVisible();

    // Initially shows "▼ Show"
    await expect(header).toContainText('Show');
    await header.click();
    // After click shows "▲ Hide"
    await expect(header).toContainText('Hide');
  });

  // ── No horizontal overflow ────────────────────────────────────────────

  test('dashboard page has no horizontal scroll', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  // ── Cards do not overflow ─────────────────────────────────────────────

  test('all visible cards are contained within the viewport', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box || box.width === 0) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
      expect(box.x).toBeGreaterThanOrEqual(-1);
    }
  });
});
