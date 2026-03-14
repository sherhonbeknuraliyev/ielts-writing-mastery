import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE, VIEWPORTS } from './helpers/viewport.js';

test.describe('AnalyticsPage deep tests (/analytics)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(3000);
  });

  // ── Page heading ──────────────────────────────────────────────────────

  test('page heading or empty state heading is visible', async ({ page }) => {
    const h1 = page.locator('h1').first();
    const emptyHeading = page.locator('.empty-state h3').first();

    const hasH1 = await h1.count() > 0;
    const hasEmptyH = await emptyHeading.count() > 0;
    expect(hasH1 || hasEmptyH).toBe(true);

    if (hasH1) {
      await expect(h1).toBeVisible();
    }
  });

  test('page heading has readable large font size', async ({ page }) => {
    const h1 = page.locator('h1').first();
    if (await h1.count() === 0) return;
    const fontSize = await h1.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(20);
  });

  // ── Empty / insufficient state ────────────────────────────────────────

  test('empty state shows when no analytics data', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    await expect(emptyState.first()).toBeVisible();
    const icon = emptyState.first().locator('.empty-state-icon');
    if (await icon.count() > 0) {
      await expect(icon).toBeVisible();
    }
  });

  test('Start Writing link in empty state is visible and meets touch target', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    const cta = emptyState.first().locator('.btn-primary');
    if (await cta.count() === 0) return;
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    if (!box) return;
    expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  // ── Overview stat cards ───────────────────────────────────────────────

  test('analytics stat cards are visible when sufficient data', async ({ page }) => {
    const statCards = page.locator('.analytics-stat-card');
    if (await statCards.count() === 0) return;

    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      await expect(statCards.nth(i)).toBeVisible();
    }
  });

  test('stat card headings (h4) are visible', async ({ page }) => {
    const statCards = page.locator('.analytics-stat-card');
    if (await statCards.count() === 0) return;

    const h4s = page.locator('.analytics-stat-card h4');
    const count = await h4s.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      await expect(h4s.nth(i)).toBeVisible();
      const fontSize = await h4s.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('stat values have large readable font', async ({ page }) => {
    const statValues = page.locator('.analytics-stat-value');
    const count = await statValues.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      await expect(statValues.nth(i)).toBeVisible();
      const fontSize = await statValues.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      // Stat values should be prominently sized
      expect(fontSize).toBeGreaterThanOrEqual(16);
    }
  });

  test('stat detail labels have readable font size', async ({ page }) => {
    const details = page.locator('.analytics-stat-detail');
    const count = await details.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontSize = await details.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('analytics overview section fits within viewport', async ({ page }) => {
    const overview = page.locator('.analytics-overview');
    if (await overview.count() === 0) return;

    const vw = page.viewportSize()!.width;
    const box = await overview.boundingBox();
    if (!box) return;
    expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
  });

  // ── Collapsible error patterns ────────────────────────────────────────

  test('error pattern cards have clickable header', async ({ page }) => {
    const errorCards = page.locator('.error-pattern-card');
    if (await errorCards.count() === 0) return;

    const header = errorCards.first().locator('.error-pattern-header');
    await expect(header).toBeVisible();
    const role = await header.getAttribute('role');
    expect(role).toBe('button');
  });

  test('clicking error pattern header expands it', async ({ page }) => {
    const errorCards = page.locator('.error-pattern-card');
    if (await errorCards.count() === 0) return;

    const header = errorCards.first().locator('.error-pattern-header');
    await header.click();
    await page.waitForTimeout(500);

    const examples = errorCards.first().locator('.error-pattern-examples');
    if (await examples.count() === 0) return;
    await expect(examples).toBeVisible();
  });

  test('clicking error pattern header again collapses it', async ({ page }) => {
    const errorCards = page.locator('.error-pattern-card');
    if (await errorCards.count() === 0) return;

    const header = errorCards.first().locator('.error-pattern-header');
    // Open
    await header.click();
    await page.waitForTimeout(300);
    // Close
    await header.click();
    await page.waitForTimeout(300);

    const examples = errorCards.first().locator('.error-pattern-examples');
    if (await examples.count() === 0) return;
    await expect(examples).not.toBeVisible();
  });

  test('error pattern header shows count badge', async ({ page }) => {
    const errorCards = page.locator('.error-pattern-card');
    if (await errorCards.count() === 0) return;

    const badge = errorCards.first().locator('.badge-warning');
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(Number(text)).toBeGreaterThan(0);
  });

  test('error pattern header shows collapse indicator arrow', async ({ page }) => {
    const errorCards = page.locator('.error-pattern-card');
    if (await errorCards.count() === 0) return;

    const header = errorCards.first().locator('.error-pattern-header');
    // Should contain ▼ or ▲
    const text = await header.textContent();
    expect(text).toMatch(/[▼▲]/);
  });

  test('error pattern card category name has readable font', async ({ page }) => {
    const errorCards = page.locator('.error-pattern-card');
    if (await errorCards.count() === 0) return;

    const header = errorCards.first().locator('.error-pattern-header span').first();
    const fontSize = await header.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    const fontWeight = await header.evaluate(
      (el) => getComputedStyle(el).fontWeight,
    );
    // fontWeight 600 or "bold"
    expect(Number(fontWeight)).toBeGreaterThanOrEqual(600);
  });

  // ── Error examples after expand ───────────────────────────────────────

  test('error examples show original → corrected format after expand', async ({ page }) => {
    const errorCards = page.locator('.error-pattern-card');
    if (await errorCards.count() === 0) return;

    const header = errorCards.first().locator('.error-pattern-header');
    await header.click();
    await page.waitForTimeout(500);

    const examples = errorCards.first().locator('.error-example');
    if (await examples.count() === 0) return;

    const firstExample = examples.first();
    const original = firstExample.locator('.error-example-original');
    const corrected = firstExample.locator('.error-example-corrected');

    if (await original.count() > 0) await expect(original).toBeVisible();
    if (await corrected.count() > 0) await expect(corrected).toBeVisible();
  });

  test('error examples have proper padding after expand', async ({ page }) => {
    const errorCards = page.locator('.error-pattern-card');
    if (await errorCards.count() === 0) return;

    const header = errorCards.first().locator('.error-pattern-header');
    await header.click();
    await page.waitForTimeout(500);

    const examples = errorCards.first().locator('.error-pattern-examples');
    if (await examples.count() === 0) return;
    const padding = await examples.evaluate(
      (el) => getComputedStyle(el).padding,
    );
    expect(padding).not.toBe('0px');
  });

  // ── Vocabulary watch table ────────────────────────────────────────────

  test('vocabulary watch table headers are bold', async ({ page }) => {
    const table = page.locator('.vocab-watch-table');
    if (await table.count() === 0) return;

    const headers = table.locator('th');
    const count = await headers.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontWeight = await headers.nth(i).evaluate(
        (el) => getComputedStyle(el).fontWeight,
      );
      expect(Number(fontWeight)).toBeGreaterThanOrEqual(600);
    }
  });

  test('vocabulary watch table cells have proper padding', async ({ page }) => {
    const table = page.locator('.vocab-watch-table');
    if (await table.count() === 0) return;

    const cells = table.locator('td');
    const count = await cells.count();
    if (count === 0) return;

    const padding = await cells.first().evaluate(
      (el) => getComputedStyle(el).padding,
    );
    expect(padding).not.toBe('0px');
  });

  test('vocabulary watch table cell text is readable', async ({ page }) => {
    const table = page.locator('.vocab-watch-table');
    if (await table.count() === 0) return;

    const cells = table.locator('td');
    const count = await cells.count();
    if (count === 0) return;

    for (let i = 0; i < Math.min(count, 6); i++) {
      const fontSize = await cells.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('vocabulary watch table count badges are visible', async ({ page }) => {
    const table = page.locator('.vocab-watch-table');
    if (await table.count() === 0) return;

    const badges = table.locator('.badge-warning');
    const count = await badges.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      await expect(badges.nth(i)).toBeVisible();
    }
  });

  // ── Recommendation cards ──────────────────────────────────────────────

  test('recommendation cards render with icon and text', async ({ page }) => {
    const recCards = page.locator('.recommendation-card');
    if (await recCards.count() === 0) return;

    const firstCard = recCards.first();
    await expect(firstCard).toBeVisible();

    const icon = firstCard.locator('.recommendation-icon');
    if (await icon.count() > 0) {
      await expect(icon).toBeVisible();
    }
  });

  test('recommendation card titles have readable font', async ({ page }) => {
    const recCards = page.locator('.recommendation-card');
    if (await recCards.count() === 0) return;

    const count = await recCards.count();
    for (let i = 0; i < count; i++) {
      const title = recCards.nth(i).locator('div[style*="fontWeight: 600"]').first();
      if (await title.count() === 0) continue;
      const fontSize = await title.evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('recommendation "Go" links meet touch target', async ({ page }) => {
    const goLinks = page.locator('.recommendation-card .btn-ghost');
    const count = await goLinks.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await goLinks.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  // ── Section card headers ──────────────────────────────────────────────

  test('card headers have readable font', async ({ page }) => {
    const cardHeaders = page.locator('.card-header h2');
    const count = await cardHeaders.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontSize = await cardHeaders.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('all visible cards fit within viewport', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box || box.width === 0) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  // ── Responsive ────────────────────────────────────────────────────────

  test('no horizontal overflow at desktop viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.reload();
    await page.waitForTimeout(3000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('no horizontal overflow at mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.reload();
    await page.waitForTimeout(3000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('stat cards fit within mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.reload();
    await page.waitForTimeout(3000);
    const vw = page.viewportSize()!.width;
    const statCards = page.locator('.analytics-stat-card');
    const count = await statCards.count();
    for (let i = 0; i < count; i++) {
      const box = await statCards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('tables scroll horizontally on mobile when needed', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.reload();
    await page.waitForTimeout(3000);

    const tables = page.locator('table');
    const count = await tables.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const wrapper = tables.nth(i).locator('..');
      const tableBox = await tables.nth(i).boundingBox();
      const wrapperBox = await wrapper.boundingBox();
      if (!tableBox || !wrapperBox) continue;

      if (tableBox.width > wrapperBox.width) {
        const overflowX = await wrapper.evaluate(
          (el) => getComputedStyle(el).overflowX,
        );
        expect(['auto', 'scroll']).toContain(overflowX);
      }
    }
  });

  test('no horizontal overflow at small mobile (320px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.smallMobile);
    await page.reload();
    await page.waitForTimeout(3000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });
});
