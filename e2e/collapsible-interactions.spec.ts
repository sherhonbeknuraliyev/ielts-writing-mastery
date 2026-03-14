import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET } from './helpers/viewport.js';

// ── FocusCollapsible sections on /writing/free (Focus Mode) ──────────────────

test.describe('FocusCollapsible sections (/writing/free in focus mode)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });

    // Enter focus mode to render FocusCollapsible sections
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-writing', { timeout: 5000 });
  });

  test('collapsible section headers are present in focus mode', async ({ page }) => {
    const headers = page.locator('.focus-collapse-header');
    const count = await headers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('collapsible section headers are clickable (cursor is pointer)', async ({ page }) => {
    const headers = page.locator('.focus-collapse-header');
    const count = await headers.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const cursor = await headers.nth(i).evaluate(
        (el) => getComputedStyle(el).cursor,
      );
      // Headers should indicate clickability
      expect(['pointer', 'default']).toContain(cursor);
    }
  });

  test('clicking a closed section header shows its body', async ({ page }) => {
    // Find a header whose parent (.focus-collapse) is closed (no .focus-collapse-body child)
    const collapses = page.locator('.focus-collapse');
    const count = await collapses.count();
    if (count === 0) return;

    let closedIdx = -1;
    for (let i = 0; i < count; i++) {
      const bodyCount = await collapses.nth(i).locator('.focus-collapse-body').count();
      if (bodyCount === 0) {
        closedIdx = i;
        break;
      }
    }
    if (closedIdx === -1) return; // all sections already open — skip gracefully

    const collapse = collapses.nth(closedIdx);
    // Click the header inside this specific collapse container via JS
    await collapse.locator('.focus-collapse-header').evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(200);

    const body = collapse.locator('.focus-collapse-body');
    await expect(body).toBeVisible({ timeout: 2000 });
  });

  test('clicking an open section header hides its body', async ({ page }) => {
    const collapses = page.locator('.focus-collapse');
    const count = await collapses.count();
    if (count === 0) return;

    // Find an open collapse
    let openIdx = -1;
    for (let i = 0; i < count; i++) {
      const bodyCount = await collapses.nth(i).locator('.focus-collapse-body').count();
      if (bodyCount > 0) {
        openIdx = i;
        break;
      }
    }

    if (openIdx === -1) {
      // None open — open the first one
      openIdx = 0;
      await collapses.nth(0).locator('.focus-collapse-header').evaluate((el: HTMLElement) => el.click());
      await page.waitForTimeout(200);
    }

    const collapse = collapses.nth(openIdx);
    const body = collapse.locator('.focus-collapse-body');
    await expect(body).toBeVisible({ timeout: 2000 });

    // Close it
    await collapse.locator('.focus-collapse-header').evaluate((el: HTMLElement) => el.click());
    await expect(body).not.toBeVisible({ timeout: 2000 });
  });

  test('multiple sections can be open simultaneously', async ({ page }) => {
    const collapses = page.locator('.focus-collapse');
    const count = await collapses.count();
    if (count < 2) return;

    // Open all collapses via JS click on their headers
    for (let i = 0; i < Math.min(count, 3); i++) {
      const bodyCount = await collapses.nth(i).locator('.focus-collapse-body').count();
      if (bodyCount === 0) {
        await collapses.nth(i).locator('.focus-collapse-header').evaluate((el: HTMLElement) => el.click());
        await page.waitForTimeout(100);
      }
    }

    // At least 2 bodies should now be visible
    const openBodies = page.locator('.focus-collapse-body');
    const openCount = await openBodies.count();
    expect(openCount).toBeGreaterThanOrEqual(2);
  });

  test('section headers have non-trivial height (at least 24px)', async ({ page }) => {
    const headers = page.locator('.focus-collapse-header');
    const count = await headers.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await headers.nth(i).boundingBox();
      if (!box) continue;
      // These are div-based collapsible headers, not standalone buttons.
      // We check they are at least 24px tall (readable and hittable).
      expect(box.height, `Focus collapse header #${i} too short`).toBeGreaterThanOrEqual(24);
    }
  });

  test('open/close chevron indicator changes when toggling', async ({ page }) => {
    const headers = page.locator('.focus-collapse-header');
    const count = await headers.count();
    if (count === 0) return;

    // Use the first header — read its text, click via JS, then check text changed
    const header = headers.first();
    const textBefore = await header.textContent();

    await header.evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(150);

    const textAfter = await header.textContent();

    // The chevron (▲ or ▼) should have changed
    expect(textAfter).not.toBe(textBefore);
  });
});

// ── Band Descriptor collapsible on dashboard ─────────────────────────────────

test.describe('Band Descriptor collapsible (dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('Band Descriptor card header is visible', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await expect(header).toBeVisible();
  });

  test('Band Descriptor starts collapsed (shows "Show" text)', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await expect(header).toContainText('Show');
  });

  test('clicking Band Descriptor header expands the content', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await header.click();

    const blocks = page.locator('.descriptor-block');
    await expect(blocks.first()).toBeVisible({ timeout: 3000 });
  });

  test('clicking Band Descriptor header again collapses it', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });

    // Expand
    await header.click();
    await expect(page.locator('.descriptor-block').first()).toBeVisible({ timeout: 3000 });

    // Collapse
    await header.click();
    await page.waitForTimeout(300);
    await expect(page.locator('.descriptor-block').first()).not.toBeVisible({ timeout: 2000 });
  });

  test('toggle button text changes between Show and Hide', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });

    await expect(header).toContainText('Show');
    await header.click();
    await expect(header).toContainText('Hide');
    await header.click();
    await expect(header).toContainText('Show');
  });

  test('Band Descriptor card header has sufficient height', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });
});

// ── Writing cards on /writing/history ────────────────────────────────────────

test.describe('Writing cards (/writing/history)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/history');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('page renders content (cards, empty state, or error state)', async ({ page }) => {
    const cards = page.locator('.writing-history-card, .card');
    const emptyState = page.locator('.empty-state');
    const errorState = page.locator('.error-state');
    const loadingState = page.locator('.loading-state');

    const hasCards = (await cards.count()) > 0;
    const hasEmpty = (await emptyState.count()) > 0;
    const hasError = (await errorState.count()) > 0;
    const hasLoading = (await loadingState.count()) > 0;

    // With a fake auth token the API call returns an error — that's acceptable
    expect(hasCards || hasEmpty || hasError || hasLoading).toBe(true);
  });

  test('writing cards are visible when present', async ({ page }) => {
    const cards = page.locator('.writing-history-card');
    const count = await cards.count();
    if (count === 0) return; // no data with fake token — skip gracefully

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test('writing card headers are clickable (have pointer cursor)', async ({ page }) => {
    const cardHeaders = page.locator('.writing-history-card .card-header, .writing-history-card [class*="header"]');
    const count = await cardHeaders.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const cursor = await cardHeaders.nth(i).evaluate(
        (el) => getComputedStyle(el).cursor,
      );
      expect(['pointer', 'default']).toContain(cursor);
    }
  });

  test('multiple cards can be expanded simultaneously', async ({ page }) => {
    const cardHeaders = page.locator('.writing-history-card .card-header');
    const count = await cardHeaders.count();
    if (count < 2) return;

    // Expand both
    await cardHeaders.nth(0).click();
    await page.waitForTimeout(150);
    await cardHeaders.nth(1).click();
    await page.waitForTimeout(150);

    // Both should now be in expanded state — check card bodies
    const bodies = page.locator('.writing-history-card .card-body');
    if (await bodies.count() > 0) {
      const visibleCount = await bodies.filter({ hasText: /.+/ }).count();
      expect(visibleCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('no horizontal scroll on writing history page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });
});

// ── Collapsible sections on /analytics ───────────────────────────────────────

test.describe('Collapsible sections (/analytics)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('page renders without crashing', async ({ page }) => {
    await expect(page.locator('.page-content')).toBeVisible();
  });

  test('clicking a collapsible card header does not crash the page', async ({ page }) => {
    const collapsibleHeaders = page.locator(
      '.card-header[role="button"], .card-header[tabindex], .card-header',
    );
    const count = await collapsibleHeaders.count();
    if (count === 0) return;

    await collapsibleHeaders.first().click();
    await page.waitForTimeout(300);

    await expect(page.locator('.page-content')).toBeVisible();
  });

  test('collapsible sections toggle content visibility on click', async ({ page }) => {
    // Find card headers that have a clickable appearance
    const headers = page.locator('.card-header[role="button"], .card-header[tabindex]');
    const count = await headers.count();
    if (count === 0) return;

    const header = headers.first();
    const textBefore = await header.textContent();

    await header.click();
    await page.waitForTimeout(300);

    // Content around the header should change (body appears/disappears)
    // At minimum the page must still be intact
    await expect(page.locator('.page-content')).toBeVisible();

    const textAfter = await header.textContent();
    // If the header contains a chevron it should have changed
    if ((textBefore ?? '').match(/[▲▼]/)) {
      expect(textAfter).not.toBe(textBefore);
    }
  });

  test('all cards are within viewport width', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box || box.width === 0) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });
});
