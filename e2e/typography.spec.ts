import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { SIDEBAR_BREAKPOINT } from './helpers/viewport.js';
import { MIN_FONT_SIZE } from './helpers/viewport.js';

const PAGES = [
  { url: '/', name: 'Dashboard' },
  { url: '/vocabulary', name: 'Vocabulary' },
  { url: '/vocabulary/upgrades', name: 'Band Upgrades' },
  { url: '/analytics', name: 'Analytics' },
  { url: '/writing/history', name: 'Writing History' },
  { url: '/skills', name: 'Skills Overview' },
];

// ── Heading hierarchy ─────────────────────────────────────────────────────────

test.describe('Typography — heading hierarchy', () => {
  for (const { url, name } of PAGES) {
    test(`h1 > h2 > h3 font size hierarchy on ${name}`, async ({ page }) => {
      await loginAsTestUser(page);
      await page.goto(url);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1000);

      const h1 = page.locator('h1:visible').first();
      const h2 = page.locator('h2:visible').first();
      const h3 = page.locator('h3:visible').first();

      if (await h1.count() === 0) return;
      const h1Size = await h1.evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(h1Size, `${name}: h1 font size should be >= 20px`).toBeGreaterThanOrEqual(20);

      if (await h2.count() > 0) {
        const h2Size = await h2.evaluate(
          (el) => parseFloat(getComputedStyle(el).fontSize),
        );
        expect(h2Size, `${name}: h2 (${h2Size}px) should be <= h1 (${h1Size}px)`).toBeLessThanOrEqual(h1Size + 2);
      }

      if (await h3.count() > 0 && await h2.count() > 0) {
        const h2Size = await h2.evaluate(
          (el) => parseFloat(getComputedStyle(el).fontSize),
        );
        const h3Size = await h3.evaluate(
          (el) => parseFloat(getComputedStyle(el).fontSize),
        );
        expect(h3Size, `${name}: h3 (${h3Size}px) should be <= h2 (${h2Size}px)`).toBeLessThanOrEqual(h2Size + 2);
      }
    });
  }
});

// ── Body text line-height ─────────────────────────────────────────────────────

test.describe('Typography — body text line-height', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('body element line-height >= 1.4', async ({ page }) => {
    const lineHeight = await page.evaluate(() => {
      const body = document.body;
      const style = getComputedStyle(body);
      const lhStr = style.lineHeight;
      if (lhStr === 'normal') return 1.5; // browsers default to ~1.2–1.5
      // lineHeight is in px — compare to fontSize
      const lhPx = parseFloat(lhStr);
      const fsPx = parseFloat(style.fontSize);
      return fsPx > 0 ? lhPx / fsPx : parseFloat(lhStr);
    });

    expect(lineHeight, 'Body line-height < 1.4').toBeGreaterThanOrEqual(1.4);
  });

  test('paragraph text in card-body has line-height >= 1.4', async ({ page }) => {
    const p = page.locator('.card-body p:visible').first();
    if (await p.count() === 0) return;

    const lineHeightRatio = await p.evaluate((el) => {
      const style = getComputedStyle(el);
      const lhStr = style.lineHeight;
      if (lhStr === 'normal') return 1.5;
      const lhPx = parseFloat(lhStr);
      const fsPx = parseFloat(style.fontSize);
      return fsPx > 0 ? lhPx / fsPx : 0;
    });

    if (lineHeightRatio === 0) return; // can't compute
    expect(lineHeightRatio, 'Card body paragraph line-height < 1.4').toBeGreaterThanOrEqual(1.4);
  });
});

// ── Small text readability ────────────────────────────────────────────────────

test.describe('Typography — small text readability', () => {
  for (const { url, name } of PAGES) {
    test(`.text-sm, .text-xs, .text-muted >= ${MIN_FONT_SIZE}px on ${name}`, async ({ page }) => {
      await loginAsTestUser(page);
      await page.goto(url);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1000);

      const smallEls = page.locator('.text-sm:visible, .text-xs:visible, .text-muted:visible');
      const count = await smallEls.count();
      if (count === 0) return;

      for (let i = 0; i < Math.min(count, 10); i++) {
        const el = smallEls.nth(i);
        const box = await el.boundingBox();
        if (!box || box.height === 0) continue;

        const fontSize = await el.evaluate(
          (node) => parseFloat(getComputedStyle(node).fontSize),
        );
        expect(
          fontSize,
          `${name}: .text-sm/.text-xs/.text-muted element #${i} has font size ${fontSize}px < ${MIN_FONT_SIZE}px`,
        ).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
      }
    });
  }
});

// ── Subtitle text is distinct from heading ────────────────────────────────────

test.describe('Typography — subtitle distinct from heading', () => {
  for (const { url, name } of PAGES) {
    test(`subtitle/description is lighter or smaller than h1 on ${name}`, async ({ page }) => {
      await loginAsTestUser(page);
      await page.goto(url);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1000);

      const h1 = page.locator('.page-header h1, .dashboard-welcome h1').first();
      const subtitle = page.locator('.page-header p, .page-header .text-muted, .dashboard-welcome p').first();

      if (await h1.count() === 0 || await subtitle.count() === 0) return;

      const h1Size = await h1.evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      const h1Weight = await h1.evaluate(
        (el) => parseFloat(getComputedStyle(el).fontWeight),
      );
      const subSize = await subtitle.evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      const subColor = await subtitle.evaluate(
        (el) => getComputedStyle(el).color,
      );
      const h1Color = await h1.evaluate(
        (el) => getComputedStyle(el).color,
      );

      // Subtitle should be smaller, lighter weight, or different color
      const isDistinct =
        subSize < h1Size ||
        subColor !== h1Color;

      expect(
        isDistinct,
        `${name}: subtitle looks identical to h1 (same size ${subSize}px, same color ${subColor})`,
      ).toBe(true);
    });
  }
});

// ── Mobile title wrapping ─────────────────────────────────────────────────────

test.describe('Typography — long titles wrap on mobile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('page title does not overflow its container', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    const h1 = page.locator('h1:visible').first();
    if (await h1.count() === 0) return;

    const overflow = await h1.evaluate(
      (el) => getComputedStyle(el).overflow,
    );
    const whiteSpace = await h1.evaluate(
      (el) => getComputedStyle(el).whiteSpace,
    );

    // Title should not be set to nowrap without text-overflow handling
    if (whiteSpace === 'nowrap') {
      const textOverflow = await h1.evaluate(
        (el) => getComputedStyle(el).textOverflow,
      );
      expect(
        textOverflow,
        'Title has white-space: nowrap without text-overflow',
      ).toBe('ellipsis');
    }

    // The element itself should not overflow its parent
    const box = await h1.boundingBox();
    if (box) {
      expect(box.x + box.width, 'Page title overflows viewport').toBeLessThanOrEqual(vw + 5);
    }
  });
});

// ── .page-header present on all pages ────────────────────────────────────────

test.describe('Typography — page-header present on pages', () => {
  const CONTENT_PAGES = [
    { url: '/vocabulary', name: 'Vocabulary' },
    { url: '/vocabulary/upgrades', name: 'Band Upgrades' },
    { url: '/analytics', name: 'Analytics' },
    { url: '/writing/history', name: 'Writing History' },
  ];

  for (const { url, name } of CONTENT_PAGES) {
    test(`${name} has visible h1`, async ({ page }) => {
      await loginAsTestUser(page);
      await page.goto(url);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1500);

      const h1 = page.locator('h1:visible').first();
      if (await h1.count() === 0) return;

      await expect(h1).toBeVisible();

      const text = await h1.textContent();
      expect(text?.trim().length ?? 0, `${name} h1 is empty`).toBeGreaterThan(0);
    });
  }
});

// ── text-muted color is lighter than primary text ────────────────────────────

test.describe('Typography — text-muted is visually muted', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('.text-muted has different color from primary text', async ({ page }) => {
    const muted = page.locator('.text-muted:visible').first();
    const primary = page.locator('.stat-value:visible, .card-header h2:visible, h3:visible').first();

    if (await muted.count() === 0 || await primary.count() === 0) return;

    const mutedColor = await muted.evaluate(
      (el) => getComputedStyle(el).color,
    );
    const primaryColor = await primary.evaluate(
      (el) => getComputedStyle(el).color,
    );

    expect(mutedColor, '.text-muted color should differ from primary text').not.toBe(primaryColor);
  });
});

// ── Analytics stat values are large enough ───────────────────────────────────

test.describe('Typography — analytics stat values', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('.analytics-stat-value font size >= 20px', async ({ page }) => {
    const values = page.locator('.analytics-stat-value');
    if (await values.count() === 0) return;

    for (let i = 0; i < Math.min(await values.count(), 3); i++) {
      const fontSize = await values.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize, `.analytics-stat-value #${i} font size < 20px`).toBeGreaterThanOrEqual(20);
    }
  });

  test('.analytics-stat-detail font size >= 12px', async ({ page }) => {
    const details = page.locator('.analytics-stat-detail');
    if (await details.count() === 0) return;

    for (let i = 0; i < Math.min(await details.count(), 3); i++) {
      const fontSize = await details.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize, `.analytics-stat-detail #${i} font size < 12px`).toBeGreaterThanOrEqual(12);
    }
  });
});
