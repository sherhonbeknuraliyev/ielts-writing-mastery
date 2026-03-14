import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE } from './helpers/viewport.js';

test.describe('WritingToolbar (/writing/free)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-toolbar', { timeout: 10000 });
  });

  test('toolbar container is visible', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    await expect(toolbar).toBeVisible();
  });

  test('toolbar is within viewport bounds', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    const box = await toolbar.boundingBox();
    expect(box).not.toBeNull();

    const vw = page.viewportSize()!.width;
    expect(box!.x, 'Toolbar starts before viewport left').toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width, 'Toolbar overflows viewport right').toBeLessThanOrEqual(vw + 5);
  });

  test('word count displays "0 words" initially', async ({ page }) => {
    const wordCount = page.locator('.word-count');
    await expect(wordCount).toBeVisible();
    await expect(wordCount).toContainText('0');
  });

  test('word count updates when typing in the textarea', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await textarea.fill('The quick brown fox jumps over the lazy dog near the river bank.');

    const wordCount = page.locator('.word-count');
    const text = await wordCount.textContent();
    // "0 words" should no longer be shown
    expect(text).not.toMatch(/^0\b/);
    // Should contain a non-zero number
    const match = text?.match(/(\d+)/);
    expect(match).not.toBeNull();
    expect(parseInt(match![1]!)).toBeGreaterThan(0);
  });

  test('timer display is visible', async ({ page }) => {
    const timer = page.locator('.timer');
    await expect(timer).toBeVisible();
    // Timer should show a time-like string (digits with colon)
    const text = await timer.textContent();
    expect(text).toMatch(/\d+:\d{2}/);
  });

  test('Save button is visible and meets 44px touch target', async ({ page }) => {
    const saveBtn = page.locator('.writing-toolbar button', { hasText: /save/i });
    await expect(saveBtn).toBeVisible();

    const box = await saveBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height, 'Save button height < 44px').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('AI Feedback button is visible and meets 44px touch target', async ({ page }) => {
    const feedbackBtn = page.locator('.writing-toolbar button', { hasText: /ai feedback/i });
    await expect(feedbackBtn).toBeVisible();

    const box = await feedbackBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height, 'AI Feedback button height < 44px').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('Model Answer button is visible and meets 44px touch target', async ({ page }) => {
    const modelBtn = page.locator('.writing-toolbar button', { hasText: /model answer/i });
    await expect(modelBtn).toBeVisible();

    const box = await modelBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height, 'Model Answer button height < 44px').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('all toolbar buttons have readable font size (>= 12px)', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    const buttons = toolbar.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const fontSize = await buttons.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize, `Toolbar button #${i} font size < ${MIN_FONT_SIZE}px`).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('word count stat labels are readable (>= 12px)', async ({ page }) => {
    const stats = page.locator('.writing-toolbar .writing-stat');
    const count = await stats.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontSize = await stats.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize, `Stat #${i} font size < ${MIN_FONT_SIZE}px`).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('toolbar does not cause horizontal overflow', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth, 'Horizontal scroll caused by toolbar').toBeLessThanOrEqual(vw + 5);
  });

  test('toolbar has non-trivial height', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    const box = await toolbar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(30);
  });

  test('target word range is displayed in toolbar', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    // Free practice shows "0–9999 target" or similar range
    const text = await toolbar.textContent();
    // Should contain a dash-separated range
    expect(text).toMatch(/\d+[–\-]\d+/);
  });
});
