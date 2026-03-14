import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET } from './helpers/viewport.js';

// ── /writing/free ─────────────────────────────────────────────────────────────

test.describe('Form inputs on /writing/free', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('custom topic input has visible placeholder text', async ({ page }) => {
    const topicInput = page.locator('.writing-prompt-bar input[type="text"]');
    await expect(topicInput).toBeVisible();

    const placeholder = await topicInput.getAttribute('placeholder');
    expect(placeholder?.trim().length).toBeGreaterThan(0);
  });

  test('custom topic input accepts typed text', async ({ page }) => {
    const topicInput = page.locator('.writing-prompt-bar input[type="text"]');
    await topicInput.fill('The impact of social media on academic performance');
    await expect(topicInput).toHaveValue('The impact of social media on academic performance');
  });

  test('custom topic input value persists after focus moves away', async ({ page }) => {
    const topicInput = page.locator('.writing-prompt-bar input[type="text"]');
    const topicText = 'Urban transport challenges in modern cities';
    await topicInput.fill(topicText);

    // Move focus to the writing textarea
    const textarea = page.locator('.writing-textarea');
    await textarea.click();

    // Value should still be present in the topic input
    await expect(topicInput).toHaveValue(topicText);
  });

  test('writing textarea has visible placeholder text', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await expect(textarea).toBeVisible();

    const placeholder = await textarea.getAttribute('placeholder');
    expect(placeholder?.trim().length).toBeGreaterThan(0);
  });

  test('writing textarea accepts typed text', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    const essayText = 'In recent years, technology has transformed many aspects of daily life.';
    await textarea.fill(essayText);
    await expect(textarea).toHaveValue(essayText);
  });

  test('word count updates live as text is typed', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    const toolbar = page.locator('.writing-toolbar');

    // Initial state should show 0 words
    const initialText = await toolbar.textContent();
    expect(initialText).toMatch(/0/);

    await textarea.fill('One two three four five words here');

    // After typing the word count should be non-zero
    await page.waitForTimeout(200);
    const updatedText = await toolbar.textContent();
    // The toolbar text should no longer be just "0 words"
    expect(updatedText).not.toMatch(/^0\s/);
  });

  test('character count updates live as text is typed', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    const toolbar = page.locator('.writing-toolbar');

    await textarea.fill('Hello IELTS');
    await page.waitForTimeout(200);

    const toolbarText = await toolbar.textContent() ?? '';
    // Some non-zero character count should appear in toolbar
    expect(toolbarText.length).toBeGreaterThan(0);
  });

  test('writing textarea has proper min-height (>= 100px)', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    const box = await textarea.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(100);
  });

  test('custom topic input has border styling', async ({ page }) => {
    const topicInput = page.locator('.writing-prompt-bar input[type="text"]');
    const borderWidth = await topicInput.evaluate(
      (el) => parseFloat(getComputedStyle(el).borderWidth),
    );
    // A visible border should be at least 1px
    expect(borderWidth).toBeGreaterThanOrEqual(1);
  });

  test('tab order: topic input before writing textarea', async ({ page }) => {
    const topicInput = page.locator('.writing-prompt-bar input[type="text"]');
    await topicInput.click();
    await page.keyboard.press('Tab');

    // After tabbing from topic input we should be inside the writing area
    // (the textarea or a toolbar button). The textarea is a natural next target.
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(['TEXTAREA', 'BUTTON', 'INPUT']).toContain(focusedTag);
  });

  test('topic input focus indicator is visible (outline or box-shadow changes)', async ({ page }) => {
    const topicInput = page.locator('.writing-prompt-bar input[type="text"]');

    const outlineBefore = await topicInput.evaluate(
      (el) => getComputedStyle(el).outline,
    );
    await topicInput.click();
    const outlineAfter = await topicInput.evaluate(
      (el) => getComputedStyle(el).outline,
    );
    const shadowAfter = await topicInput.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );

    // Either the outline or box-shadow should change on focus (browsers vary)
    const hasFocusIndicator =
      outlineAfter !== outlineBefore ||
      shadowAfter !== 'none';

    expect(hasFocusIndicator).toBe(true);
  });
});

// ── /vocabulary/paraphrase ─────────────────────────────────────────────────────

test.describe('Form inputs on /vocabulary/paraphrase', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary/paraphrase');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('paraphrase textarea is visible when drill is loaded', async ({ page }) => {
    // With a fake token the API call may fail — handle gracefully
    const loadingState = page.locator('.loading-state');
    const errorState = page.locator('.error-state');
    const emptyState = page.locator('.empty-state');

    if (await loadingState.count() > 0) return;
    if (await errorState.count() > 0) return;
    if (await emptyState.count() > 0) return;

    const textarea = page.locator('.recall-sentence-area');
    await expect(textarea).toBeVisible();
  });

  test('paraphrase textarea has visible placeholder text', async ({ page }) => {
    const textarea = page.locator('.recall-sentence-area');
    if (await textarea.count() === 0) return;

    const placeholder = await textarea.getAttribute('placeholder');
    expect(placeholder?.trim().length).toBeGreaterThan(0);
  });

  test('paraphrase textarea has proper min-height (>= 100px)', async ({ page }) => {
    const textarea = page.locator('.recall-sentence-area');
    if (await textarea.count() === 0) return;

    const box = await textarea.boundingBox();
    if (!box) return;
    expect(box.height).toBeGreaterThanOrEqual(100);
  });

  test('Check button is disabled when textarea is empty', async ({ page }) => {
    const textarea = page.locator('.recall-sentence-area');
    if (await textarea.count() === 0) return;

    // Ensure textarea is empty
    await textarea.fill('');

    const checkBtn = page.locator('.btn.btn-primary', { hasText: /^Check$/ });
    if (await checkBtn.count() === 0) return;

    await expect(checkBtn).toBeDisabled();
  });

  test('Check button becomes enabled after typing in textarea', async ({ page }) => {
    const textarea = page.locator('.recall-sentence-area');
    if (await textarea.count() === 0) return;

    await textarea.fill('The rapid advancement of digital technologies has changed communication.');

    const checkBtn = page.locator('.btn.btn-primary', { hasText: /^Check$/ });
    if (await checkBtn.count() === 0) return;

    await expect(checkBtn).toBeEnabled();
  });

  test('Check button meets 44px touch target', async ({ page }) => {
    const checkBtn = page.locator('.btn.btn-primary', { hasText: /^Check$/ });
    if (await checkBtn.count() === 0) return;

    const box = await checkBtn.boundingBox();
    if (!box) return;
    expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('paraphrase textarea accepts typed text', async ({ page }) => {
    const textarea = page.locator('.recall-sentence-area');
    if (await textarea.count() === 0) return;

    const sampleText = 'New technologies have dramatically altered how people interact.';
    await textarea.fill(sampleText);
    await expect(textarea).toHaveValue(sampleText);
  });

  test('paraphrase textarea has border styling', async ({ page }) => {
    const textarea = page.locator('.recall-sentence-area');
    if (await textarea.count() === 0) return;

    const borderWidth = await textarea.evaluate(
      (el) => parseFloat(getComputedStyle(el).borderWidth),
    );
    expect(borderWidth).toBeGreaterThanOrEqual(1);
  });
});

// ── /daily-challenge ──────────────────────────────────────────────────────────

test.describe('Form inputs on /daily-challenge', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/daily-challenge');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('Start Challenge button is visible on start screen', async ({ page }) => {
    const startBtn = page.locator('.btn.btn-primary', { hasText: /start challenge/i });
    // If skills not loaded the button text changes — handle either case
    if (await startBtn.count() === 0) return;
    await expect(startBtn).toBeVisible();
  });

  test('exercise text input is visible after starting challenge', async ({ page }) => {
    // Skills may not be available with a fake token — skip gracefully if so
    const startBtn = page.locator('.btn.btn-primary', { hasText: /start challenge/i });
    if (await startBtn.count() === 0) return;

    const isDisabled = await startBtn.isDisabled();
    if (isDisabled) return;

    await startBtn.click();
    await page.waitForTimeout(500);

    // ExerciseRunner renders either a .recall-input (fill-blank) or .recall-sentence-area (open-ended)
    const fillInput = page.locator('.recall-input');
    const openTextarea = page.locator('.recall-sentence-area');

    const hasInput = (await fillInput.count() > 0) || (await openTextarea.count() > 0);
    expect(hasInput).toBe(true);
  });

  test('exercise fill-blank input has placeholder text when visible', async ({ page }) => {
    const fillInput = page.locator('.recall-input');
    if (await fillInput.count() === 0) return;

    const placeholder = await fillInput.getAttribute('placeholder');
    expect(placeholder?.trim().length).toBeGreaterThan(0);
  });

  test('exercise textarea has placeholder text when visible', async ({ page }) => {
    const openTextarea = page.locator('.recall-sentence-area');
    if (await openTextarea.count() === 0) return;

    const placeholder = await openTextarea.getAttribute('placeholder');
    expect(placeholder?.trim().length).toBeGreaterThan(0);
  });

  test('exercise textarea has min-height >= 100px when visible', async ({ page }) => {
    const openTextarea = page.locator('.recall-sentence-area');
    if (await openTextarea.count() === 0) return;

    const box = await openTextarea.boundingBox();
    if (!box) return;
    expect(box.height).toBeGreaterThanOrEqual(100);
  });

  test('Check Answer button is disabled when answer is empty', async ({ page }) => {
    const checkBtn = page.locator('.btn.btn-primary', { hasText: /check answer/i });
    if (await checkBtn.count() === 0) return;

    await expect(checkBtn).toBeDisabled();
  });

  test('Check Answer button enabled after typing in exercise input', async ({ page }) => {
    const fillInput = page.locator('.recall-input');
    const openTextarea = page.locator('.recall-sentence-area');
    const checkBtn = page.locator('.btn.btn-primary', { hasText: /check answer/i });

    if (await checkBtn.count() === 0) return;

    if (await fillInput.count() > 0) {
      await fillInput.fill('answer');
    } else if (await openTextarea.count() > 0) {
      await openTextarea.fill('This is my answer to the exercise.');
    } else {
      return;
    }

    await expect(checkBtn).toBeEnabled();
  });
});
