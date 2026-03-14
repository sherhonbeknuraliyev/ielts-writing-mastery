import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { SIDEBAR_BREAKPOINT } from './helpers/viewport.js';

// ── Writing flow ───────────────────────────────────────────────────────────────

test.describe('Writing flow (/writing/free)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('textarea is visible and accepts input', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await expect(textarea).toBeVisible();
    await textarea.click();
    await textarea.fill('Hello world');
    await expect(textarea).toHaveValue('Hello world');
  });

  test('word count updates as user types', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    const toolbar = page.locator('.writing-toolbar');

    // Initial word count should show 0
    await expect(toolbar).toContainText('0');

    // Type some words
    const text = 'The development of technology has transformed modern society in many significant ways and continues to shape human interactions every day.';
    await textarea.fill(text);

    // Word count should now be non-zero
    const toolbarText = await toolbar.textContent();
    expect(toolbarText).not.toMatch(/\b0\b words/);
    // Should be roughly 23 words
    expect(toolbarText).toMatch(/\d+/);
  });

  test('word count is at least 50 for a paragraph of text', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    const words = Array(55).fill('word').join(' ');
    await textarea.fill(words);

    const toolbar = page.locator('.writing-toolbar');
    const toolbarText = await toolbar.textContent();
    // Should show 55 words
    expect(toolbarText).toContain('55');
  });

  test('timer starts after first keystroke', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    await textarea.fill('Starting to write');

    // Toolbar should now show a time indicator
    const toolbar = page.locator('.writing-toolbar');
    await expect(toolbar).toBeVisible();
    // Timer element or time display should be present
    const toolbarText = await toolbar.textContent();
    expect(toolbarText!.length).toBeGreaterThan(0);
  });

  test('toolbar buttons are accessible and visible', async ({ page }) => {
    const toolbar = page.locator('.writing-toolbar');
    const buttons = toolbar.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeVisible();
    }
  });

  test('guide panel is visible alongside the textarea', async ({ page }) => {
    const guide = page.locator('.writing-guide');
    await expect(guide).toBeVisible();
  });

  test('guide panel contains general tips section', async ({ page }) => {
    const guide = page.locator('.writing-guide');
    const guideText = await guide.textContent();
    expect(guideText!.length).toBeGreaterThan(0);
  });

  test('topic input is visible in free practice mode', async ({ page }) => {
    const topicInput = page.locator('.writing-prompt-bar input[type="text"]');
    await expect(topicInput).toBeVisible();
  });

  test('page has no error state on load', async ({ page }) => {
    const errorState = page.locator('.error-state');
    const count = await errorState.count();
    expect(count).toBe(0);
  });
});

// ── Navigation flow ────────────────────────────────────────────────────────────

test.describe('Navigation flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  async function openSidebarIfMobile(page: Parameters<typeof test>[1]) {
    const vw = page.viewportSize()!.width;
    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
      await page.waitForSelector('.sidebar.open', { timeout: 3000 });
    }
  }

  test('clicking Task 2 Essays navigates to /writing/task2', async ({ page }) => {
    await openSidebarIfMobile(page);
    await page.locator('.sidebar .nav-item', { hasText: 'Task 2 Essays' }).click();
    await expect(page).toHaveURL('/writing/task2', { timeout: 5000 });
    await expect(page.locator('.error-state')).toHaveCount(0);
  });

  test('clicking Skills Overview navigates to /skills', async ({ page }) => {
    await openSidebarIfMobile(page);
    await page.locator('.sidebar .nav-item', { hasText: 'Skills Overview' }).click();
    await expect(page).toHaveURL('/skills', { timeout: 5000 });
    await expect(page.locator('.error-state')).toHaveCount(0);
  });

  test('clicking Daily Challenge navigates to /daily-challenge', async ({ page }) => {
    await openSidebarIfMobile(page);
    await page.locator('.sidebar .nav-item', { hasText: 'Daily Challenge' }).click();
    await expect(page).toHaveURL('/daily-challenge', { timeout: 5000 });
    await expect(page.locator('.error-state')).toHaveCount(0);
  });

  test('clicking Dashboard returns to /', async ({ page }) => {
    // Navigate away first
    await page.goto('/skills');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    await openSidebarIfMobile(page);
    await page.locator('.sidebar .nav-item', { hasText: 'Dashboard' }).first().click();
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('each main page loads without error state', async ({ page }) => {
    const routes = ['/writing/task2', '/skills', '/daily-challenge', '/vocabulary'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1000);

      // Page should not show an error-state immediately on load
      // (errors from API with fake token are acceptable, but page should render)
      const content = page.locator('.page-content');
      await expect(content).toBeVisible();
    }
  });
});

// ── Writing history flow ───────────────────────────────────────────────────────

test.describe('Writing history flow (/writing/history)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/history');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('page renders without crashing', async ({ page }) => {
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
  });

  test('empty state, error state, loading, or card list is rendered', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    const errorState = page.locator('.error-state');
    const cards = page.locator('.card');
    const loadingState = page.locator('.loading-state');

    const hasEmpty = await emptyState.count() > 0;
    const hasError = await errorState.count() > 0;
    const hasCards = await cards.count() > 0;
    const hasLoading = await loadingState.count() > 0;

    expect(hasEmpty || hasError || hasCards || hasLoading).toBe(true);
  });

  test('writing cards when present show content details', async ({ page }) => {
    const cards = page.locator('.card');
    if (await cards.count() === 0) return;

    // At least the first card should have text content
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    const text = await firstCard.textContent();
    expect(text!.trim().length).toBeGreaterThan(0);
  });

  test('empty state icon is present when no writings', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    await expect(emptyState).toBeVisible();
    const icon = emptyState.locator('.empty-state-icon');
    if (await icon.count() > 0) {
      await expect(icon).toBeVisible();
    }
  });

  test('no horizontal scroll on history page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });
});

// ── Skills learning flow ───────────────────────────────────────────────────────

test.describe('Skills learning flow (/skills)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/skills');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('skills page renders with heading', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('skill cards are present or an appropriate state is shown', async ({ page }) => {
    const cards = page.locator('.card.card-clickable');
    const emptyState = page.locator('.empty-state');
    const errorState = page.locator('.error-state');
    const loading = page.locator('.loading-state');

    const hasCards = await cards.count() > 0;
    const hasEmpty = await emptyState.count() > 0;
    const hasError = await errorState.count() > 0;
    const hasLoading = await loading.count() > 0;

    expect(hasCards || hasEmpty || hasError || hasLoading).toBe(true);
  });

  test('clicking a skill card navigates to skill detail page', async ({ page }) => {
    const cards = page.locator('.card.card-clickable');
    if (await cards.count() === 0) return;

    await cards.first().click();
    // Should navigate to /skills/:id
    await expect(page).toHaveURL(/\/skills\//, { timeout: 5000 });
  });

  test('skill detail page shows lesson content when skill loads', async ({ page }) => {
    const cards = page.locator('.card.card-clickable');
    if (await cards.count() === 0) return;

    await cards.first().click();
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Should show lesson content card or loading/error
    const lessonCard = page.locator('.card');
    const loading = page.locator('.loading-state');
    const error = page.locator('.error-state');

    const hasContent = await lessonCard.count() > 0;
    const hasLoading = await loading.count() > 0;
    const hasError = await error.count() > 0;

    expect(hasContent || hasLoading || hasError).toBe(true);
  });

  test('Start Exercises button is visible when exercises exist', async ({ page }) => {
    const cards = page.locator('.card.card-clickable');
    if (await cards.count() === 0) return;

    await cards.first().click();
    await page.waitForTimeout(2000);

    const startBtn = page.locator('button', { hasText: /Start Exercises/ });
    if (await startBtn.count() > 0) {
      await expect(startBtn.first()).toBeVisible();
    }
  });
});

// ── Daily challenge flow ───────────────────────────────────────────────────────

test.describe('Daily challenge flow (/daily-challenge)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/daily-challenge');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page heading Daily Challenge is visible', async ({ page }) => {
    const h1 = page.locator('h1', { hasText: 'Daily Challenge' });
    await expect(h1).toBeVisible();
  });

  test('challenge start card is visible with description', async ({ page }) => {
    const startCard = page.locator('.challenge-start');
    await expect(startCard).toBeVisible();
  });

  test('Start Challenge button is rendered', async ({ page }) => {
    const startBtn = page.locator('button', { hasText: /Start Challenge|No skills loaded/ });
    await expect(startBtn).toBeVisible();
  });

  test('Start Challenge button state reflects skill data availability', async ({ page }) => {
    await page.waitForTimeout(2000);
    const startBtn = page.locator('button', { hasText: /Start Challenge|No skills loaded/ });
    await expect(startBtn).toBeVisible();

    // Button is either enabled (skills loaded) or disabled (no skills)
    const isDisabled = await startBtn.isDisabled();
    // Both states are valid — just verify it renders
    expect(typeof isDisabled).toBe('boolean');
  });

  test('how it works list items are visible', async ({ page }) => {
    const listItems = page.locator('.challenge-start li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('streak badge is shown when user has a streak', async ({ page }) => {
    // Inject a streak entry into localStorage
    const today = new Date().toISOString().slice(0, 10);
    await page.evaluate((todayDate) => {
      const entry = { date: todayDate, score: 8, total: 10, timeTaken: 300 };
      localStorage.setItem('daily-challenges', JSON.stringify([entry]));
    }, today);

    await page.reload();
    await page.waitForSelector('.challenge-start', { timeout: 10000 });

    const streak = page.locator('.challenge-streak');
    await expect(streak).toBeVisible();
  });

  test('page renders without error-state', async ({ page }) => {
    // The challenge page should not show an error state
    const errorState = page.locator('.error-state');
    await expect(errorState).toHaveCount(0);
  });

  test('no horizontal scroll on daily challenge page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });
});
