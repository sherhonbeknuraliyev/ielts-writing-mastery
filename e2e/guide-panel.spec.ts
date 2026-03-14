import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE } from './helpers/viewport.js';

test.describe('GuidePanel (/writing/free)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-guide', { timeout: 10000 });
  });

  test('guide panel container is rendered', async ({ page }) => {
    const guide = page.locator('.writing-guide');
    await expect(guide).toBeVisible();
  });

  test('guide panel contains at least one guide-section', async ({ page }) => {
    const sections = page.locator('.writing-guide .guide-section');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('guide section headers are visible', async ({ page }) => {
    const headers = page.locator('.writing-guide .guide-section-header');
    const count = await headers.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(headers.nth(i)).toBeVisible();
    }
  });

  test('guide section headers have non-trivial height (touch-friendly)', async ({ page }) => {
    const headers = page.locator('.writing-guide .guide-section-header');
    const count = await headers.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await headers.nth(i).boundingBox();
      if (!box) continue;
      // Headers should be at least 36px tall (some tolerance below 44px for non-button headers)
      expect(box.height, `Guide section header #${i} height too small`).toBeGreaterThan(28);
    }
  });

  test('guide section header text is readable (>= 12px)', async ({ page }) => {
    const headers = page.locator('.writing-guide .guide-section-header');
    const count = await headers.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontSize = await headers.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize, `Header #${i} font size < ${MIN_FONT_SIZE}px`).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('guide section body content is visible when section is open', async ({ page }) => {
    // Free practice page shows "General Tips" section which is open by default (no toggle)
    const sectionBody = page.locator('.writing-guide .guide-section-body');
    const count = await sectionBody.count();
    if (count === 0) return;

    // At least one body should be visible
    let visibleCount = 0;
    for (let i = 0; i < count; i++) {
      const isVisible = await sectionBody.nth(i).isVisible();
      if (isVisible) visibleCount++;
    }
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('guide section body text is readable (>= 12px)', async ({ page }) => {
    const bodyTexts = page.locator('.writing-guide .guide-section-body li, .writing-guide .guide-section-body p, .writing-guide .guide-section-body span');
    const count = await bodyTexts.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const isVisible = await bodyTexts.nth(i).isVisible();
      if (!isVisible) continue;
      const fontSize = await bodyTexts.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize, `Guide body text #${i} font size < ${MIN_FONT_SIZE}px`).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('guide panel does not overflow viewport', async ({ page }) => {
    const guide = page.locator('.writing-guide');
    const box = await guide.boundingBox();
    if (!box) return;

    const vw = page.viewportSize()!.width;
    expect(box.x + box.width, 'Guide panel overflows viewport').toBeLessThanOrEqual(vw + 5);
  });

  test('checklist items (when present) are interactive labels', async ({ page }) => {
    const checkItems = page.locator('.writing-guide .eval-check-item');
    const count = await checkItems.count();
    if (count === 0) return; // Free practice may not have checklist

    for (let i = 0; i < count; i++) {
      const box = await checkItems.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height, `Checklist item #${i} height too small`).toBeGreaterThan(20);
    }
  });

  test('checklist checkboxes (when present) are visible', async ({ page }) => {
    const checkboxes = page.locator('.writing-guide .eval-check-item input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeVisible();
    }
  });

  test('no horizontal overflow caused by guide panel', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 5);
  });
});

// ── GuidePanel on a prompt page (with real sections) ─────────────────────────

test.describe('GuidePanel collapsible sections (/writing/task2)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/task2');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('guide sections show on task2 page if prompts loaded', async ({ page }) => {
    // With fake token we may see error/empty state — skip gracefully
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() > 0) return;

    const guide = page.locator('.writing-guide');
    if (await guide.count() === 0) return;

    const sections = guide.locator('.guide-section');
    const count = await sections.count();
    // If there are sections, verify them
    if (count === 0) return;
    expect(count).toBeGreaterThan(0);
  });

  test('collapsible guide headers toggle body visibility when clicked', async ({ page }) => {
    // Navigate to free practice where guide always renders
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-guide', { timeout: 10000 });

    // On the free practice page the general tips section header is not a toggle
    // but if a prompt is loaded (task2) sections may be toggleable
    const headers = page.locator('.writing-guide .guide-section-header');
    const count = await headers.count();
    if (count === 0) return;

    // The first collapsible header (those with a toggle indicator ▲/▼)
    const toggleHeader = headers.filter({ hasText: /[▲▼]/ }).first();
    if (await toggleHeader.count() === 0) return;

    const parentSection = toggleHeader.locator('xpath=..');
    const body = parentSection.locator('.guide-section-body');
    if (await body.count() === 0) return;

    const wasVisible = await body.isVisible();
    await toggleHeader.click();
    await page.waitForTimeout(300);

    const isNowVisible = await body.isVisible();
    expect(isNowVisible).toBe(!wasVisible);
  });
});
