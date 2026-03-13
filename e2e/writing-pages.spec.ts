import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE } from './helpers/viewport.js';

// ── Task Prompts page ─────────────────────────────────────────────────────────

test.describe('TaskPromptsPage (/writing/task2)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/task2');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page heading is visible', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('info banner is visible', async ({ page }) => {
    const banner = page.locator('.info-banner');
    await expect(banner).toBeVisible();
  });

  test('filter bar chips are visible and meet touch target', async ({ page }) => {
    const chips = page.locator('.filter-chip');
    const count = await chips.count();
    expect(count).toBeGreaterThanOrEqual(4); // all, intermediate, advanced, expert

    for (let i = 0; i < count; i++) {
      const box = await chips.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('loading state shows spinner or error state shows message', async ({ page }) => {
    // With a fake token the API call will fail — expect either loading, error, or empty state
    const spinner = page.locator('.loading-state');
    const errorState = page.locator('.error-state');
    const emptyState = page.locator('.empty-state');
    const cards = page.locator('.card.card-clickable');

    await page.waitForTimeout(2000);

    const hasSpinner = await spinner.count() > 0;
    const hasError = await errorState.count() > 0;
    const hasEmpty = await emptyState.count() > 0;
    const hasCards = await cards.count() > 0;

    expect(hasSpinner || hasError || hasEmpty || hasCards).toBe(true);
  });

  test('error state has readable text', async ({ page }) => {
    await page.waitForTimeout(2000);
    const errorState = page.locator('.error-state');
    if (await errorState.count() === 0) return;

    await expect(errorState).toBeVisible();
    const text = await errorState.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('empty state is centered when visible', async ({ page }) => {
    await page.waitForTimeout(2000);
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    const box = await emptyState.boundingBox();
    expect(box).not.toBeNull();

    const vw = page.viewportSize()!.width;
    // Empty state should not be pushed to one edge (allow for sidebar offset)
    expect(box!.x + box!.width / 2).toBeGreaterThan(vw * 0.25);
  });

  test('no horizontal scroll', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('prompt cards (when loaded) fit within viewport', async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator('.card.card-clickable');
    const count = await cards.count();
    const vw = page.viewportSize()!.width;

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('Start Writing button in prompt cards meets touch target', async ({ page }) => {
    await page.waitForTimeout(2000);
    const startBtns = page.locator('.card-footer .btn-primary');
    const count = await startBtns.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await startBtns.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });
});

// ── Writing Practice page ─────────────────────────────────────────────────────

test.describe('WritingPracticePage (/writing/free)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('writing textarea is visible and full width', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await expect(textarea).toBeVisible();

    const vw = page.viewportSize()!.width;
    const box = await textarea.boundingBox();
    expect(box).not.toBeNull();
    // Textarea should be reasonably wide (at least 50% of viewport)
    expect(box!.width).toBeGreaterThan(vw * 0.5 - 10);
  });

  test('writing textarea has a reasonable minimum height', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    const box = await textarea.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(100);
  });

  test('topic input field is visible in free-practice mode', async ({ page }) => {
    const topicInput = page.locator('.writing-prompt-bar input[type="text"]');
    await expect(topicInput).toBeVisible();
  });

  test('Focus Mode button is visible and meets touch target', async ({ page }) => {
    const focusBtn = page.locator('button', { hasText: 'Focus Mode' });
    await expect(focusBtn).toBeVisible();

    const box = await focusBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('WritingToolbar is rendered', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    await expect(toolbar).toBeVisible();
  });

  test('toolbar action buttons meet touch target', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    const buttons = toolbar.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('word count display is visible', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    // Word count is part of the toolbar
    await expect(toolbar).toContainText('0');
  });

  test('typing in textarea updates state (word count increments)', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await textarea.fill('This is a test sentence for the IELTS writing practice page.');

    // Toolbar should reflect updated count
    const toolbar = page.locator('.writing-toolbar');
    const toolbarText = await toolbar.textContent();
    // The word count should now be non-zero
    expect(toolbarText).not.toMatch(/^0\s/);
  });

  test('prompt bar collapse button is visible and works', async ({ page }) => {
    const collapseBtn = page.locator('.writing-prompt-bar button', { hasText: 'Hide' });
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();

    // After collapse the input should be hidden
    const topicInput = page.locator('.writing-prompt-bar input[type="text"]');
    await expect(topicInput).not.toBeVisible({ timeout: 2000 });
  });

  test('guide panel is rendered alongside the textarea', async ({ page }) => {
    const guide = page.locator('.writing-guide');
    await expect(guide).toBeVisible();
  });

  test('no horizontal scroll on writing practice page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });
});

// ── Writing History page ──────────────────────────────────────────────────────

test.describe('WritingHistoryPage (/writing/history)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/history');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page renders without crashing', async ({ page }) => {
    // Should show loading, empty state, or history items — not a blank page
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
  });

  test('empty state is properly styled when no writings', async ({ page }) => {
    await page.waitForTimeout(2000);
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    await expect(emptyState).toBeVisible();
    const icon = emptyState.locator('.empty-state-icon');
    await expect(icon).toBeVisible();

    const box = await emptyState.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(80);
  });

  test('no horizontal scroll on writing history page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('score bar labels have sufficient font size', async ({ page }) => {
    await page.waitForTimeout(2000);
    const labels = page.locator('.score-bar-label');
    const count = await labels.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontSize = await labels.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('score bar tracks have non-trivial height', async ({ page }) => {
    await page.waitForTimeout(2000);
    const tracks = page.locator('.score-bar-track');
    const count = await tracks.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await tracks.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(4);
    }
  });
});
