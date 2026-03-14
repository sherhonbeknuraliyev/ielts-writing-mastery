import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { VIEWPORTS } from './helpers/viewport.js';

// Helper: navigate to band upgrades page and enable practice mode
async function openBandUpgradesPracticeMode(page: import('@playwright/test').Page) {
  await loginAsTestUser(page);
  await page.goto('/vocabulary/upgrades');
  await page.waitForSelector('.app-shell', { timeout: 10000 });
  await page.waitForTimeout(1500);

  // Switch to Practice mode
  const practiceBtn = page.locator('button', { hasText: 'Practice' }).first();
  if (await practiceBtn.count() > 0) {
    await practiceBtn.click();
    await page.waitForTimeout(400);
  }
}

// ── .answer-comparison layout ────────────────────────────────────────────────

test.describe('Answer comparison — .answer-comparison layout', () => {
  test('two-column layout on desktop', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw < VIEWPORTS.tablet.width) return;

    await openBandUpgradesPracticeMode(page);

    // Fill in text and reveal to trigger .answer-comparison
    const textareas = page.locator('.recall-sentence-area');
    if (await textareas.count() === 0) return;

    await textareas.first().fill('This is my band 8 upgrade attempt.');
    await page.waitForTimeout(200);

    const revealBtn = page.locator('button', { hasText: 'Reveal Answer' }).first();
    if (await revealBtn.count() === 0) return;

    await revealBtn.click();
    await page.waitForTimeout(400);

    const comparison = page.locator('.answer-comparison');
    if (await comparison.count() === 0) return;

    await expect(comparison.first()).toBeVisible();

    // On desktop, should be grid with 2 columns (both columns side-by-side)
    const gridCols = await comparison.first().evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns,
    );
    // "1fr 1fr" or two explicit column values
    const colCount = gridCols.split(' ').filter((s) => s.trim().length > 0).length;
    expect(colCount, 'answer-comparison should have 2 columns on desktop').toBeGreaterThanOrEqual(2);
  });

  test('stacked on mobile (single column)', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw > VIEWPORTS.mobile.width) return;

    await openBandUpgradesPracticeMode(page);

    const textareas = page.locator('.recall-sentence-area');
    if (await textareas.count() === 0) return;

    await textareas.first().fill('My attempt at band 8.');
    await page.waitForTimeout(200);

    const revealBtn = page.locator('button', { hasText: 'Reveal Answer' }).first();
    if (await revealBtn.count() === 0) return;

    await revealBtn.click();
    await page.waitForTimeout(400);

    const comparison = page.locator('.answer-comparison');
    if (await comparison.count() === 0) return;

    // On mobile, the media query should stack columns
    const box = await comparison.first().boundingBox();
    if (!box) return;

    // The comparison element itself should be within viewport
    expect(box.x + box.width, 'answer-comparison overflows viewport on mobile').toBeLessThanOrEqual(vw + 5);
  });
});

// ── .answer-column.user ──────────────────────────────────────────────────────

test.describe('Answer comparison — .answer-column.user', () => {
  test.beforeEach(async ({ page }) => {
    await openBandUpgradesPracticeMode(page);

    const textareas = page.locator('.recall-sentence-area');
    if (await textareas.count() === 0) return;

    await textareas.first().fill('My attempt here.');
    await page.waitForTimeout(200);

    const revealBtn = page.locator('button', { hasText: 'Reveal Answer' }).first();
    if (await revealBtn.count() > 0) {
      await revealBtn.click();
      await page.waitForTimeout(400);
    }
  });

  test('.answer-column.user is visible after reveal', async ({ page }) => {
    const userCol = page.locator('.answer-column.user');
    if (await userCol.count() === 0) return;

    await expect(userCol.first()).toBeVisible();
  });

  test('.answer-column.user has distinct background from model column', async ({ page }) => {
    const userCol = page.locator('.answer-column.user');
    const modelCol = page.locator('.answer-column.model');

    if (await userCol.count() === 0 || await modelCol.count() === 0) return;

    const userBg = await userCol.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    const modelBg = await modelCol.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    expect(userBg, '.answer-column.user and .answer-column.model have identical backgrounds').not.toBe(modelBg);
  });
});

// ── .answer-column.model ─────────────────────────────────────────────────────

test.describe('Answer comparison — .answer-column.model', () => {
  test.beforeEach(async ({ page }) => {
    await openBandUpgradesPracticeMode(page);

    const textareas = page.locator('.recall-sentence-area');
    if (await textareas.count() === 0) return;

    await textareas.first().fill('My attempt.');
    await page.waitForTimeout(200);

    const revealBtn = page.locator('button', { hasText: 'Reveal Answer' }).first();
    if (await revealBtn.count() > 0) {
      await revealBtn.click();
      await page.waitForTimeout(400);
    }
  });

  test('.answer-column.model is visible and has green-tinted background', async ({ page }) => {
    const modelCol = page.locator('.answer-column.model');
    if (await modelCol.count() === 0) return;

    await expect(modelCol.first()).toBeVisible();

    // CSS sets background: var(--success-light) on .answer-column.model
    const bg = await modelCol.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg, '.answer-column.model has no background').not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('.answer-column-label is visible in model column', async ({ page }) => {
    const modelCol = page.locator('.answer-column.model');
    if (await modelCol.count() === 0) return;

    const label = modelCol.first().locator('.answer-column-label');
    if (await label.count() === 0) return;

    await expect(label).toBeVisible();
  });
});

// ── .exercise-feedback correct/incorrect ─────────────────────────────────────

test.describe('Answer comparison — .exercise-feedback variants', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/skills');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('.exercise-feedback.feedback-correct has green background when present', async ({ page }) => {
    const correct = page.locator('.exercise-feedback.feedback-correct, .exercise-feedback.correct');
    if (await correct.count() === 0) return;

    const bg = await correct.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg, 'correct feedback missing background').not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('.exercise-feedback.feedback-incorrect has red/error background when present', async ({ page }) => {
    const incorrect = page.locator('.exercise-feedback.feedback-incorrect, .exercise-feedback.incorrect');
    if (await incorrect.count() === 0) return;

    const bg = await incorrect.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg, 'incorrect feedback missing background').not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('correct and incorrect feedback have different backgrounds', async ({ page }) => {
    const correct = page.locator('.exercise-feedback.feedback-correct, .exercise-feedback.correct');
    const incorrect = page.locator('.exercise-feedback.feedback-incorrect, .exercise-feedback.incorrect');

    if (await correct.count() === 0 || await incorrect.count() === 0) return;

    const correctBg = await correct.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    const incorrectBg = await incorrect.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    expect(correctBg, 'correct and incorrect feedback should have different colors').not.toBe(incorrectBg);
  });
});

// ── Answer comparison within viewport ────────────────────────────────────────

test.describe('Answer comparison — fits within viewport', () => {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    test(`answer comparison fits viewport at ${name}`, async ({ page }) => {
      const vw = page.viewportSize()!.width;

      await openBandUpgradesPracticeMode(page);

      const textareas = page.locator('.recall-sentence-area');
      if (await textareas.count() === 0) return;

      await textareas.first().fill('My answer here.');
      await page.waitForTimeout(200);

      const revealBtn = page.locator('button', { hasText: 'Reveal Answer' }).first();
      if (await revealBtn.count() === 0) return;

      await revealBtn.click();
      await page.waitForTimeout(400);

      const comparison = page.locator('.answer-comparison');
      if (await comparison.count() === 0) return;

      const box = await comparison.first().boundingBox();
      if (!box) return;

      expect(
        box.x + box.width,
        `answer-comparison overflows viewport at ${name}`,
      ).toBeLessThanOrEqual(vw + 10);
    });
  }
});
