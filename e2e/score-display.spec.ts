import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { VIEWPORTS } from './helpers/viewport.js';

// ── .overall-band ────────────────────────────────────────────────────────────

test.describe('Score display — .overall-band', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/history');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('.overall-band is centered when present', async ({ page }) => {
    // expand first card to reveal feedback
    const cards = page.locator('.card');
    const count = await cards.count();
    if (count === 0) return;

    const header = cards.first().locator('.card-header');
    if (await header.count() > 0) {
      await header.first().click();
      await page.waitForTimeout(400);

      const showBtn = page.locator('button', { hasText: 'Show AI Feedback' }).first();
      if (await showBtn.count() > 0) {
        await showBtn.click();
        await page.waitForTimeout(400);
      }
    }

    const band = page.locator('.overall-band');
    if (await band.count() === 0) return;

    const textAlign = await band.first().evaluate(
      (el) => getComputedStyle(el).textAlign,
    );
    expect(textAlign, '.overall-band is not text-center').toBe('center');
  });

  test('.overall-band-number font size >= 32px', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();
    if (count === 0) return;

    const header = cards.first().locator('.card-header');
    if (await header.count() > 0) {
      await header.first().click();
      await page.waitForTimeout(400);

      const showBtn = page.locator('button', { hasText: 'Show AI Feedback' }).first();
      if (await showBtn.count() > 0) {
        await showBtn.click();
        await page.waitForTimeout(400);
      }
    }

    const numberEl = page.locator('.overall-band-number');
    if (await numberEl.count() === 0) return;

    const fontSize = await numberEl.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, '.overall-band-number font size < 32px').toBeGreaterThanOrEqual(32);
  });
});

// ── .score-bar-item ──────────────────────────────────────────────────────────

test.describe('Score display — .score-bar-item', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/history');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  async function expandFirstFeedback(page: import('@playwright/test').Page) {
    const cards = page.locator('.card');
    if (await cards.count() === 0) return;
    const header = cards.first().locator('.card-header');
    if (await header.count() > 0) {
      await header.first().click();
      await page.waitForTimeout(400);
    }
    const showBtn = page.locator('button', { hasText: 'Show AI Feedback' }).first();
    if (await showBtn.count() > 0) {
      await showBtn.click();
      await page.waitForTimeout(400);
    }
  }

  test('.score-bar-item label and value are visible', async ({ page }) => {
    await expandFirstFeedback(page);
    const items = page.locator('.score-bar-item');
    if (await items.count() === 0) return;

    for (let i = 0; i < Math.min(await items.count(), 4); i++) {
      const label = items.nth(i).locator('.score-bar-label');
      const value = items.nth(i).locator('.score-bar-value');
      await expect(label).toBeVisible();
      await expect(value).toBeVisible();
    }
  });

  test('.score-bar-value has a color applied', async ({ page }) => {
    await expandFirstFeedback(page);
    const values = page.locator('.score-bar-value');
    if (await values.count() === 0) return;

    const color = await values.first().evaluate(
      (el) => getComputedStyle(el).color,
    );
    // Should not be the transparent/empty default
    expect(color).not.toBe('');
    expect(color).not.toBe('transparent');
  });
});

// ── .score-bar-track / .score-bar-fill ──────────────────────────────────────

test.describe('Score display — .score-bar-track and .score-bar-fill', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/history');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  async function expandFirstFeedback(page: import('@playwright/test').Page) {
    const cards = page.locator('.card');
    if (await cards.count() === 0) return;
    const header = cards.first().locator('.card-header');
    if (await header.count() > 0) {
      await header.first().click();
      await page.waitForTimeout(400);
    }
    const showBtn = page.locator('button', { hasText: 'Show AI Feedback' }).first();
    if (await showBtn.count() > 0) {
      await showBtn.click();
      await page.waitForTimeout(400);
    }
  }

  test('.score-bar-track height >= 4px', async ({ page }) => {
    await expandFirstFeedback(page);
    const tracks = page.locator('.score-bar-track');
    if (await tracks.count() === 0) return;

    for (let i = 0; i < Math.min(await tracks.count(), 4); i++) {
      const box = await tracks.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height, `.score-bar-track #${i} height < 4px`).toBeGreaterThanOrEqual(4);
    }
  });

  test('.score-bar-track has border-radius', async ({ page }) => {
    await expandFirstFeedback(page);
    const tracks = page.locator('.score-bar-track');
    if (await tracks.count() === 0) return;

    const radius = await tracks.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).borderRadius),
    );
    expect(radius, '.score-bar-track has no border-radius').toBeGreaterThan(0);
  });

  test('.score-bar-fill has background color', async ({ page }) => {
    await expandFirstFeedback(page);
    const fills = page.locator('.score-bar-fill');
    if (await fills.count() === 0) return;

    const bg = await fills.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg, '.score-bar-fill has no background color').not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('.score-bar-fill width is percentage-based (between 0 and 100%)', async ({ page }) => {
    await expandFirstFeedback(page);
    const fills = page.locator('.score-bar-fill');
    if (await fills.count() === 0) return;

    const { fillWidth, trackWidth } = await fills.first().evaluate((el) => {
      const fill = el as HTMLElement;
      const track = fill.parentElement as HTMLElement;
      return {
        fillWidth: fill.getBoundingClientRect().width,
        trackWidth: track?.getBoundingClientRect().width ?? 0,
      };
    });

    if (trackWidth > 0) {
      const ratio = fillWidth / trackWidth;
      expect(ratio, '.score-bar-fill width ratio should be between 0 and 1').toBeGreaterThanOrEqual(0);
      expect(ratio, '.score-bar-fill width ratio should be between 0 and 1').toBeLessThanOrEqual(1.01);
    }
  });
});

// ── .score-summary and .score-big ────────────────────────────────────────────

test.describe('Score display — .score-summary and .score-big', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/skills');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('.score-summary is readable when present', async ({ page }) => {
    const summary = page.locator('.score-summary');
    if (await summary.count() === 0) return;

    await expect(summary.first()).toBeVisible();
    const box = await summary.first().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(0);
  });

  test('.score-big has font size >= 32px', async ({ page }) => {
    const scoreBig = page.locator('.score-big');
    if (await scoreBig.count() === 0) return;

    const fontSize = await scoreBig.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, '.score-big font size < 32px').toBeGreaterThanOrEqual(32);
  });
});

// ── Badge variants ────────────────────────────────────────────────────────────

test.describe('Score display — band badges', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/history');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('.badge-success is visible with non-zero size', async ({ page }) => {
    const badges = page.locator('.badge-success');
    if (await badges.count() === 0) return;

    const box = await badges.first().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('.badge-primary is visible with non-zero size', async ({ page }) => {
    const badges = page.locator('.badge-primary');
    if (await badges.count() === 0) return;

    const box = await badges.first().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('band badges have padding', async ({ page }) => {
    const badge = page.locator('.badge').first();
    if (await badge.count() === 0) return;

    const padding = await badge.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        top: parseFloat(style.paddingTop),
        right: parseFloat(style.paddingRight),
        bottom: parseFloat(style.paddingBottom),
        left: parseFloat(style.paddingLeft),
      };
    });
    expect(padding.right + padding.left, 'Badge has no horizontal padding').toBeGreaterThan(0);
  });
});

// ── Mobile readability ────────────────────────────────────────────────────────

test.describe('Score display — mobile readability', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/history');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('score elements are within viewport on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw > VIEWPORTS.mobile.width) return;

    const cards = page.locator('.card');
    if (await cards.count() === 0) return;

    const header = cards.first().locator('.card-header');
    if (await header.count() > 0) {
      await header.first().click();
      await page.waitForTimeout(400);
    }

    const showBtn = page.locator('button', { hasText: 'Show AI Feedback' }).first();
    if (await showBtn.count() > 0) {
      await showBtn.click();
      await page.waitForTimeout(400);
    }

    const items = page.locator('.score-bar-item');
    for (let i = 0; i < Math.min(await items.count(), 4); i++) {
      const box = await items.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width, `Score bar item #${i} overflows viewport on mobile`).toBeLessThanOrEqual(vw + 5);
    }
  });
});
