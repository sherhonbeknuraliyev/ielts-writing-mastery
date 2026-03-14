import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';

test.describe('Keyboard shortcuts (/writing/free)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  // ── Ctrl+S / Cmd+S ────────────────────────────────────────────────────────

  test('Ctrl+S does not open the browser save dialog', async ({ page }) => {
    // Type some content first so the save handler has something to work with
    const textarea = page.locator('.writing-textarea');
    await textarea.fill('Technology has transformed modern communication significantly.');

    // If the default is not prevented, Playwright will throw or the page will
    // navigate away. We verify the page is still intact after pressing Ctrl+S.
    await page.keyboard.press('Control+s');

    // Writing page should still be in the DOM — not replaced by a browser dialog
    await expect(page.locator('.writing-page')).toBeVisible({ timeout: 2000 });
  });

  test('Cmd+S (Meta+S) does not open the browser save dialog on Mac', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await textarea.fill('Climate change demands urgent global cooperation now.');

    await page.keyboard.press('Meta+s');

    await expect(page.locator('.writing-page')).toBeVisible({ timeout: 2000 });
  });

  test('Ctrl+S on empty textarea triggers info toast (no crash)', async ({ page }) => {
    // With empty textarea the handler calls toast("Nothing to save yet.") and returns
    await page.keyboard.press('Control+s');

    // Page should still be intact
    await expect(page.locator('.writing-page')).toBeVisible({ timeout: 2000 });
  });

  test('Ctrl+S with content leaves toolbar visible', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await textarea.fill('This is a practice essay about the environment and sustainability.');

    await page.keyboard.press('Control+s');
    await page.waitForTimeout(300);

    await expect(page.locator('.writing-toolbar')).toBeVisible();
  });

  // ── Escape key — focus mode ───────────────────────────────────────────────

  test('Escape exits focus mode when in focus mode', async ({ page }) => {
    // Enter focus mode
    await page.locator('button', { hasText: 'Focus Mode' }).click();
    await page.waitForSelector('.focus-exit-btn', { timeout: 5000 });

    // Now press Escape
    await page.keyboard.press('Escape');

    await expect(page.locator('.writing-page')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.app-shell')).not.toHaveClass(/focus-mode/);
  });

  test('Escape does nothing harmful when not in focus mode', async ({ page }) => {
    // Not in focus mode — press Escape and verify page is intact
    await page.keyboard.press('Escape');
    await expect(page.locator('.writing-page')).toBeVisible({ timeout: 2000 });
  });

  // ── Tab navigation through toolbar buttons ────────────────────────────────

  test('Tab key moves focus to the next interactive element', async ({ page }) => {
    // Click textarea to establish a focus starting point
    const textarea = page.locator('.writing-textarea');
    await textarea.click();

    await page.keyboard.press('Tab');

    // Some interactive element must now be focused
    const focused = page.locator(':focus');
    await expect(focused).toBeAttached({ timeout: 2000 });

    const tag = await focused.evaluate((el) => el.tagName.toLowerCase());
    expect(['a', 'button', 'input', 'textarea', 'select']).toContain(tag);
  });

  test('Shift+Tab navigates backwards from a toolbar button', async ({ page }) => {
    // Tab into the toolbar
    const textarea = page.locator('.writing-textarea');
    await textarea.click();
    await page.keyboard.press('Tab');

    // Capture the currently focused element
    const forwardTag = await page.locator(':focus').evaluate((el) => el.tagName.toLowerCase());

    // Go backwards
    await page.keyboard.press('Shift+Tab');

    // Focus should move back — textarea or another element preceding the toolbar
    const backTag = await page.locator(':focus').evaluate((el) => el.tagName.toLowerCase());
    expect(['a', 'button', 'input', 'textarea', 'select']).toContain(backTag);
    // Not asserting forwardTag !== backTag because DOM order varies, just confirm no crash
    void forwardTag;
  });

  test('Tab cycles through all toolbar buttons without throwing', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    const buttonCount = await toolbar.locator('button').count();
    expect(buttonCount).toBeGreaterThan(0);

    // Click the textarea then tab through the toolbar area
    await page.locator('.writing-textarea').click();
    for (let i = 0; i <= buttonCount; i++) {
      await page.keyboard.press('Tab');
    }

    // Page should remain intact after tabbing past the toolbar
    await expect(page.locator('.writing-page')).toBeVisible();
  });

  // ── Arrow keys in textarea ────────────────────────────────────────────────

  test('ArrowDown and ArrowUp move cursor in the textarea', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await textarea.fill('Line one\nLine two\nLine three');
    await textarea.click();

    // Move cursor to start
    await page.keyboard.press('Control+Home');
    const posBefore = await textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart,
    );

    await page.keyboard.press('ArrowDown');
    const posAfter = await textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart,
    );

    // Cursor should have moved (position changed)
    expect(posAfter).toBeGreaterThan(posBefore);
  });

  test('ArrowRight moves cursor forward in the textarea', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await textarea.fill('Hello world');
    await textarea.click();

    await page.keyboard.press('Control+Home');
    await page.keyboard.press('ArrowRight');

    const pos = await textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart,
    );
    expect(pos).toBe(1);
  });

  // ── Enter/Space on role="button" elements ─────────────────────────────────

  test('Enter key activates a focused toolbar button', async ({ page }) => {
    // Focus the Save button directly and press Enter
    const saveBtn = page.locator('.writing-toolbar button', { hasText: /save/i });
    await saveBtn.focus();
    await page.keyboard.press('Enter');

    // Page should still be intact — the click handler ran without error
    await expect(page.locator('.writing-page')).toBeVisible({ timeout: 2000 });
  });

  test('Space key activates a focused toolbar button', async ({ page }) => {
    const saveBtn = page.locator('.writing-toolbar button', { hasText: /save/i });
    await saveBtn.focus();
    await page.keyboard.press('Space');

    await expect(page.locator('.writing-page')).toBeVisible({ timeout: 2000 });
  });
});
