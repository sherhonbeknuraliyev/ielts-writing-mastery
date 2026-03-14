import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, SIDEBAR_BREAKPOINT } from './helpers/viewport.js';

test.describe('Focus Mode (/writing/free)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('Focus Mode button exists and is visible', async ({ page }) => {
    const focusBtn = page.locator('button', { hasText: 'Focus Mode' });
    await expect(focusBtn).toBeVisible();
  });

  test('Focus Mode button has proper touch target (44px)', async ({ page }) => {
    const focusBtn = page.locator('button', { hasText: 'Focus Mode' });
    const box = await focusBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('clicking Focus Mode button gives app-shell the focus-mode class', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop test — sidebar is present');

    const focusBtn = page.locator('button', { hasText: 'Focus Mode' });
    await focusBtn.click();

    const shell = page.locator('.app-shell');
    await expect(shell).toHaveClass(/focus-mode/);
  });

  test('sidebar is hidden in focus mode on desktop', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop test — sidebar is present');

    // Sidebar visible before
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-writing', { timeout: 5000 });

    // Sidebar should no longer be in the DOM (Layout removes it when focusMode=true)
    await expect(sidebar).not.toBeAttached();
  });

  test('focus exit button appears in focus mode', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-exit-btn', { timeout: 5000 });

    const exitBtn = page.locator('.focus-exit-btn');
    await expect(exitBtn).toBeVisible();
  });

  test('focus exit button has correct aria-label', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-exit-btn', { timeout: 5000 });

    const exitBtn = page.locator('.focus-exit-btn');
    await expect(exitBtn).toHaveAttribute('aria-label', 'Exit focus mode');
  });

  test('clicking exit button restores normal layout', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-exit-btn', { timeout: 5000 });

    await page.locator('.focus-exit-btn').click();

    // Should return to normal writing page
    await expect(page.locator('.writing-page')).toBeVisible({ timeout: 5000 });

    // focus-mode class should be gone
    const shell = page.locator('.app-shell');
    await expect(shell).not.toHaveClass(/focus-mode/);
  });

  test('pressing Escape key exits focus mode', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-exit-btn', { timeout: 5000 });

    await page.keyboard.press('Escape');

    await expect(page.locator('.writing-page')).toBeVisible({ timeout: 5000 });
    const shell = page.locator('.app-shell');
    await expect(shell).not.toHaveClass(/focus-mode/);
  });

  test('focus mode renders the focus-writing container', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-writing', { timeout: 5000 });

    const focusWriting = page.locator('.focus-writing');
    await expect(focusWriting).toBeVisible();
  });

  test('focus mode has three-column layout with center textarea on desktop', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop test');

    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-col-center', { timeout: 5000 });

    const center = page.locator('.focus-col-center');
    await expect(center).toBeVisible();

    // Center column should contain the writing textarea
    const textarea = center.locator('.writing-textarea');
    await expect(textarea).toBeVisible();
  });

  test('writing textarea takes substantial width in focus mode', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.writing-textarea', { timeout: 5000 });

    const textarea = page.locator('.writing-textarea');
    const box = await textarea.boundingBox();
    expect(box).not.toBeNull();
    // In focus mode the textarea should fill at least 30% of the viewport
    expect(box!.width).toBeGreaterThan(vw * 0.3);
  });

  test('no horizontal overflow in focus mode', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-writing', { timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 2);
  });

  test('focus mode preserves textarea content', async ({ page }) => {
    const sampleText = 'This essay will discuss the importance of renewable energy sources.';
    const textarea = page.locator('.writing-textarea');
    await textarea.fill(sampleText);

    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-writing', { timeout: 5000 });

    const focusTextarea = page.locator('.writing-textarea');
    await expect(focusTextarea).toHaveValue(sampleText);
  });

  test('toolbar is visible inside focus mode', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-writing', { timeout: 5000 });

    const toolbar = page.locator('.writing-toolbar');
    await expect(toolbar).toBeVisible();
  });
});

test.describe('Focus Mode on mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('Focus Mode button is accessible on mobile', async ({ page }) => {
    const focusBtn = page.locator('button', { hasText: 'Focus Mode' });
    await expect(focusBtn).toBeVisible();
  });

  test('focus mode activates on mobile and shows focus-writing', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-writing', { timeout: 5000 });

    const focusWriting = page.locator('.focus-writing');
    await expect(focusWriting).toBeVisible();
  });

  test('no horizontal overflow in focus mode on mobile', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-writing', { timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 2);
  });

  test('columns stack vertically on mobile in focus mode', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-columns', { timeout: 5000 });

    // On mobile the columns should stack (each full width)
    const colLeft = page.locator('.focus-col-left');
    const colCenter = page.locator('.focus-col-center');

    if (await colLeft.count() > 0 && await colCenter.count() > 0) {
      const boxLeft = await colLeft.boundingBox();
      const boxCenter = await colCenter.boundingBox();

      if (boxLeft && boxCenter) {
        const vw = page.viewportSize()!.width;
        // Both should span full width on mobile
        expect(boxLeft.width).toBeGreaterThan(vw * 0.8);
        expect(boxCenter.width).toBeGreaterThan(vw * 0.8);
      }
    }
  });

  test('focus exit button is visible on mobile', async ({ page }) => {
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-exit-btn', { timeout: 5000 });
    await expect(page.locator('.focus-exit-btn')).toBeVisible();
  });
});
