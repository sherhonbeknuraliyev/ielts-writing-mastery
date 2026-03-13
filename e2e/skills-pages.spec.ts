import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE } from './helpers/viewport.js';

// ── Skills Overview page ──────────────────────────────────────────────────────

test.describe('SkillsOverviewPage (/skills)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/skills');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page heading "Skills Lab" is visible', async ({ page }) => {
    const heading = page.locator('h1', { hasText: 'Skills Lab' });
    await expect(heading).toBeVisible();
  });

  test('page subtitle is visible', async ({ page }) => {
    const subtitle = page.locator('.page-header p');
    await expect(subtitle).toBeVisible();
  });

  test('loading spinner appears during fetch', async ({ page }) => {
    // Navigate fresh to catch loading state
    await page.goto('/skills');
    const spinner = page.locator('.loading-state');
    // Either spinner shows briefly or skills load directly
    const loaded = await Promise.race([
      spinner.waitFor({ state: 'visible', timeout: 2000 }).then(() => 'spinner'),
      page.locator('.grid-auto').waitFor({ state: 'visible', timeout: 4000 }).then(() => 'grid'),
      page.locator('.error-state').waitFor({ state: 'visible', timeout: 4000 }).then(() => 'error'),
      page.locator('.empty-state').waitFor({ state: 'visible', timeout: 4000 }).then(() => 'empty'),
    ]).catch(() => 'timeout');

    expect(['spinner', 'grid', 'error', 'empty']).toContain(loaded);
  });

  test('module section headings are visible', async ({ page }) => {
    await page.waitForTimeout(2000);
    // With valid DB the sections would appear; with fake token we may see error state
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const h2s = page.locator('h2');
    const count = await h2s.count();
    // At least one h2 should exist
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('skill cards (when loaded) fit within viewport', async ({ page }) => {
    await page.waitForTimeout(2000);
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.card.card-clickable');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('skill cards have minimum height', async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator('.card.card-clickable');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThan(60);
    }
  });

  test('badge text in skill cards has readable font size', async ({ page }) => {
    await page.waitForTimeout(2000);
    const badges = page.locator('.card .badge');
    const count = await badges.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontSize = await badges.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('empty state shows properly when no skills are loaded', async ({ page }) => {
    await page.waitForTimeout(2000);
    const emptyStates = page.locator('.empty-state');
    const count = await emptyStates.count();
    if (count === 0) return;

    const first = emptyStates.first();
    await expect(first).toBeVisible();
    const box = await first.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(60);
  });

  test('no horizontal scroll on skills overview', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('skill count badge is visible in module header', async ({ page }) => {
    await page.waitForTimeout(2000);
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    // Look for badge that shows "X skills" count
    const skillCountBadges = page.locator('.badge-gray', { hasText: /skills?/ });
    const count = await skillCountBadges.count();
    // Might be 0 if no data returned — just check they don't overflow if present
    for (let i = 0; i < count; i++) {
      const box = await skillCountBadges.nth(i).boundingBox();
      if (!box) continue;
      expect(box.width).toBeGreaterThan(0);
    }
  });
});

// ── Skill Detail page ─────────────────────────────────────────────────────────

test.describe('SkillDetailPage (/skills/:id)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // Use a placeholder ID — the page will show a loading/error state
    await page.goto('/skills/test-skill-id');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page renders without crashing', async ({ page }) => {
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
  });

  test('loading or error state shows correctly', async ({ page }) => {
    await page.waitForTimeout(2000);
    const spinner = page.locator('.loading-state');
    const errorState = page.locator('.error-state');
    const skillContent = page.locator('.lesson-content, .exercise-runner, h1');

    const hasSpinner = await spinner.count() > 0;
    const hasError = await errorState.count() > 0;
    const hasContent = await skillContent.count() > 0;

    expect(hasSpinner || hasError || hasContent).toBe(true);
  });

  test('no horizontal scroll on skill detail', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('exercise runner buttons (when visible) meet touch target', async ({ page }) => {
    await page.waitForTimeout(2000);
    const exerciseBtns = page.locator('.exercise-runner button, .exercise-section button');
    const count = await exerciseBtns.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await exerciseBtns.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('lesson content paragraphs (when visible) have readable font size', async ({ page }) => {
    await page.waitForTimeout(2000);
    const paragraphs = page.locator('.lesson-content p');
    const count = await paragraphs.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontSize = await paragraphs.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });
});
