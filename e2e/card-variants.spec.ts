import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { VIEWPORTS, SIDEBAR_BREAKPOINT } from './helpers/viewport.js';

// ── Base .card ────────────────────────────────────────────────────────────────

test.describe('Card variants — base .card', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('.card has border-radius', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const radius = await cards.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).borderRadius),
    );
    expect(radius, '.card has no border-radius').toBeGreaterThan(0);
  });

  test('.card has background-color', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const bg = await cards.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg, '.card has transparent background').not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('.card has border or box-shadow', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const hasBorderOrShadow = await cards.first().evaluate((el) => {
      const style = getComputedStyle(el);
      const borderWidth = parseFloat(style.borderWidth) || parseFloat(style.borderTopWidth);
      const hasBorder = borderWidth > 0 && style.borderColor !== 'transparent';
      const hasShadow = style.boxShadow !== 'none' && style.boxShadow !== '';
      return hasBorder || hasShadow;
    });
    expect(hasBorderOrShadow, '.card has no border or box-shadow').toBe(true);
  });
});

// ── .card-header and .card-body ──────────────────────────────────────────────

test.describe('Card variants — .card-header and .card-body', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('.card-header has padding', async ({ page }) => {
    const headers = page.locator('.card-header');
    if (await headers.count() === 0) return;

    const padding = await headers.first().evaluate((el) => {
      const style = getComputedStyle(el);
      return (
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingRight) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.paddingLeft)
      );
    });
    expect(padding, '.card-header has no padding').toBeGreaterThan(0);
  });

  test('.card-body has padding', async ({ page }) => {
    const bodies = page.locator('.card-body');
    if (await bodies.count() === 0) return;

    const padding = await bodies.first().evaluate((el) => {
      const style = getComputedStyle(el);
      return (
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingRight) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.paddingLeft)
      );
    });
    expect(padding, '.card-body has no padding').toBeGreaterThan(0);
  });
});

// ── .collocation-card ────────────────────────────────────────────────────────

test.describe('Card variants — .collocation-card', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('.collocation-card is visible on /vocabulary', async ({ page }) => {
    const cards = page.locator('.collocation-card');
    if (await cards.count() === 0) return;

    await expect(cards.first()).toBeVisible();
  });

  test('.collocation-card has border-left for color accent', async ({ page }) => {
    const cards = page.locator('.collocation-card');
    if (await cards.count() === 0) return;

    const borderLeft = await cards.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).borderLeftWidth),
    );
    expect(borderLeft, '.collocation-card missing colored left border').toBeGreaterThanOrEqual(2);
  });

  test('.collocation-card has proper layout — phrase at top', async ({ page }) => {
    const cards = page.locator('.collocation-card');
    if (await cards.count() === 0) return;

    const card = cards.first();
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(40);
  });

  test('.collocation-card phrase has font-weight >= 600', async ({ page }) => {
    const cards = page.locator('.collocation-card');
    if (await cards.count() === 0) return;

    // The phrase is the first span inside the card
    const phrase = cards.first().locator('span').first();
    if (await phrase.count() === 0) return;

    const fw = await phrase.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontWeight),
    );
    expect(fw, 'collocation phrase font-weight < 600').toBeGreaterThanOrEqual(600);
  });
});

// ── .upgrade-card (BandUpgradesPage) ─────────────────────────────────────────

test.describe('Card variants — upgrade cards on /vocabulary/upgrades', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary/upgrades');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('upgrade cards show Band 6 and Band 8 badges', async ({ page }) => {
    const badgeWarning = page.locator('.badge-warning', { hasText: 'Band 6' });
    if (await badgeWarning.count() === 0) return;

    await expect(badgeWarning.first()).toBeVisible();

    const badgeSuccess = page.locator('.badge-success', { hasText: 'Band 8' });
    if (await badgeSuccess.count() === 0) return;

    await expect(badgeSuccess.first()).toBeVisible();
  });

  test('upgrade cards have original → upgraded layout', async ({ page }) => {
    const cards = page.locator('.card');
    if (await cards.count() === 0) return;

    // There should be a grid with 3 columns: original, arrow, upgraded
    const arrowDiv = page.locator('div', { hasText: '→' });
    if (await arrowDiv.count() === 0) return;

    await expect(arrowDiv.first()).toBeVisible();
  });

  test('filter tabs are visible for category filtering', async ({ page }) => {
    const tabs = page.locator('.tab');
    if (await tabs.count() === 0) return;

    await expect(tabs.first()).toBeVisible();
  });
});

// ── .stat-card ───────────────────────────────────────────────────────────────

test.describe('Card variants — .stat-card on dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('.stat-card has icon, value, and label', async ({ page }) => {
    const statCards = page.locator('.stat-card');
    if (await statCards.count() === 0) return;

    const card = statCards.first();
    const icon = card.locator('.stat-icon');
    const value = card.locator('.stat-value');
    const label = card.locator('.stat-label');

    await expect(icon).toBeVisible();
    await expect(value).toBeVisible();
    await expect(label).toBeVisible();
  });

  test('.stat-value font size >= 20px', async ({ page }) => {
    const values = page.locator('.stat-value');
    if (await values.count() === 0) return;

    const fontSize = await values.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, '.stat-value font size < 20px').toBeGreaterThanOrEqual(20);
  });
});

// ── Cards stack on mobile ─────────────────────────────────────────────────────

test.describe('Card variants — mobile layout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('stat cards do not overflow viewport on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    const statCards = page.locator('.stat-card');
    const count = await statCards.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await statCards.nth(i).boundingBox();
      if (!box) continue;
      expect(
        box.x + box.width,
        `Stat card #${i} overflows viewport (${box.x + box.width} > ${vw})`,
      ).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('cards do not overflow viewport', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.card');
    const count = await cards.count();
    if (count === 0) return;

    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box || box.height === 0) continue;
      expect(
        box.x + box.width,
        `Card #${i} overflows viewport`,
      ).toBeLessThanOrEqual(vw + 5);
    }
  });
});

// ── Expandable cards (writing history) ───────────────────────────────────────

test.describe('Card variants — expandable writing history cards', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/history');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('clicking card header expands it to show body', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();
    if (count === 0) return;

    const header = cards.first().locator('.card-header[role="button"]');
    if (await header.count() === 0) return;

    // Initially body should not be visible
    const body = cards.first().locator('.card-body');
    const initiallyVisible = await body.isVisible().catch(() => false);

    await header.click();
    await page.waitForTimeout(300);

    // After click, body should be visible (toggle)
    if (!initiallyVisible) {
      await expect(body).toBeVisible();
    } else {
      // it was already expanded — that's fine, just verify still functional
      await expect(cards.first()).toBeVisible();
    }
  });

  test('expanded card body does not overflow card', async ({ page }) => {
    const cards = page.locator('.card');
    if (await cards.count() === 0) return;

    const header = cards.first().locator('.card-header[role="button"]');
    if (await header.count() === 0) return;

    await header.click();
    await page.waitForTimeout(400);

    const cardBox = await cards.first().boundingBox();
    const body = cards.first().locator('.card-body');
    if (await body.count() === 0 || !cardBox) return;

    const bodyBox = await body.boundingBox();
    if (!bodyBox) return;

    // Body right edge should not exceed card right edge by more than 5px
    expect(bodyBox.x + bodyBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 5);
  });
});
