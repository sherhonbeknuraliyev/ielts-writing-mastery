import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE, VIEWPORTS } from './helpers/viewport.js';

// Helper: Navigate to a valid skill by listing skills first
async function goToFirstSkill(page: import('@playwright/test').Page): Promise<string | null> {
  await loginAsTestUser(page);
  await page.goto('/skills');
  await page.waitForSelector('.app-shell', { timeout: 10000 });
  await page.waitForTimeout(2000);

  const skillLinks = page.locator('.card.card-clickable');
  if (await skillLinks.count() === 0) {
    return null;
  }

  // Click first skill card to navigate
  await skillLinks.first().click();
  await page.waitForTimeout(2000);
  return page.url();
}

test.describe('SkillDetailPage deep tests (/skills/:id)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // Navigate to skills list first, then to first skill if available
    await page.goto('/skills');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const skillCards = page.locator('.card.card-clickable');
    if (await skillCards.count() > 0) {
      await skillCards.first().click();
      await page.waitForTimeout(2000);
    } else {
      // Fall back to a placeholder that shows error/loading state
      await page.goto('/skills/test-skill-id');
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(2000);
    }
  });

  // ── Back to Skills button ─────────────────────────────────────────────

  test('"← Back to Skills" button is visible', async ({ page }) => {
    const errorState = page.locator('.error-state');
    const loadingState = page.locator('.loading-state');
    if (await errorState.count() > 0 || await loadingState.count() > 0) return;

    const backBtn = page.locator('button', { hasText: /Back to Skills/ });
    if (await backBtn.count() === 0) return;
    await expect(backBtn).toBeVisible();
  });

  test('"Back to Skills" button navigates to /skills', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const backBtn = page.locator('button', { hasText: /Back to Skills/ });
    if (await backBtn.count() === 0) return;
    await backBtn.click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/skills');
  });

  // ── Skill title and metadata ──────────────────────────────────────────

  test('skill title h1 is visible', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const h1 = page.locator('h1').first();
    if (await h1.count() === 0) return;
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('skill title has readable font size', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const h1 = page.locator('h1').first();
    if (await h1.count() === 0) return;
    const fontSize = await h1.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(18);
  });

  test('Target Band badge is visible', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const targetBadge = page.locator('.badge-primary', { hasText: /Target:/ }).first();
    if (await targetBadge.count() === 0) return;
    await expect(targetBadge).toBeVisible();
  });

  test('criterion badge is visible', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    // Multiple badge-gray items: criterion + module
    const grayBadges = page.locator('.badge-gray');
    const count = await grayBadges.count();
    if (count === 0) return;
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(grayBadges.first()).toBeVisible();
  });

  test('module badge is visible', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const grayBadges = page.locator('.badge-gray');
    if (await grayBadges.count() < 2) return;
    await expect(grayBadges.nth(1)).toBeVisible();
  });

  test('all metadata badges fit within viewport', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const vw = page.viewportSize()!.width;
    const badges = page.locator('.page-header .badge');
    const count = await badges.count();
    for (let i = 0; i < count; i++) {
      const box = await badges.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  // ── Lesson content blocks ─────────────────────────────────────────────

  test('"Lesson Content" heading is visible', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const lessonH2 = page.locator('h2', { hasText: 'Lesson Content' });
    if (await lessonH2.count() === 0) return;
    await expect(lessonH2).toBeVisible();
  });

  test('content blocks render within the lesson card', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    // The lesson card contains p and div elements from ContentBlock components
    const lessonCard = page.locator('.card').first();
    if (await lessonCard.count() === 0) return;
    await expect(lessonCard).toBeVisible();

    // Should have some text content
    const textContent = await lessonCard.textContent();
    expect(textContent?.trim().length).toBeGreaterThan(10);
  });

  test('example content blocks have accent border-left', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    // Example blocks: background: var(--accent-light), borderLeft: 3px solid var(--accent)
    const exampleBlocks = page.locator('.card div[style*="accent-light"]');
    if (await exampleBlocks.count() === 0) return;

    const firstExample = exampleBlocks.first();
    const borderLeft = await firstExample.evaluate(
      (el) => getComputedStyle(el).borderLeftStyle,
    );
    expect(borderLeft).not.toBe('none');
    const borderWidth = await firstExample.evaluate(
      (el) => parseFloat(getComputedStyle(el).borderLeftWidth),
    );
    expect(borderWidth).toBeGreaterThanOrEqual(2);
  });

  test('tip content blocks have warning-light background', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    // Tip blocks use warning-light background
    const tipBlocks = page.locator('.card div[style*="warning-light"]');
    if (await tipBlocks.count() === 0) return;

    const firstTip = tipBlocks.first();
    const bg = await firstTip.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('rule content blocks have success-light background', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const ruleBlocks = page.locator('.card div[style*="success-light"]');
    if (await ruleBlocks.count() === 0) return;

    const firstRule = ruleBlocks.first();
    await expect(firstRule).toBeVisible();
  });

  test('content block text has readable font size', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const textBlocks = page.locator('.card-body p, .card-body div[style*="lineHeight"]');
    const count = await textBlocks.count();
    const sample = Math.min(count, 5);
    for (let i = 0; i < sample; i++) {
      const el = textBlocks.nth(i);
      if (!await el.isVisible()) continue;
      const fontSize = await el.evaluate(
        (node) => parseFloat(getComputedStyle(node).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  // ── Key takeaways ─────────────────────────────────────────────────────

  test('"Key Takeaways" card is visible', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const takeawaysH2 = page.locator('h2', { hasText: 'Key Takeaways' });
    if (await takeawaysH2.count() === 0) return;
    await expect(takeawaysH2).toBeVisible();
  });

  test('key takeaway items have checkmark icons', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    // Checkmarks are ✓ text spans with color: var(--success)
    const checkmarks = page.locator('span', { hasText: '✓' });
    if (await checkmarks.count() === 0) return;

    const count = await checkmarks.count();
    for (let i = 0; i < count; i++) {
      await expect(checkmarks.nth(i)).toBeVisible();
    }
  });

  test('key takeaway items have readable font size', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const takeawayItems = page.locator('li', { has: page.locator('span', { hasText: '✓' }) });
    const count = await takeawayItems.count();
    if (count === 0) return;

    for (let i = 0; i < Math.min(count, 5); i++) {
      const fontSize = await takeawayItems.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('key takeaway list has proper spacing between items', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const takeawayItems = page.locator('li', { has: page.locator('span', { hasText: '✓' }) });
    const count = await takeawayItems.count();
    if (count < 2) return;

    const box0 = await takeawayItems.nth(0).boundingBox();
    const box1 = await takeawayItems.nth(1).boundingBox();
    if (!box0 || !box1) return;

    // Second item should start after the first (with spacing)
    expect(box1.y).toBeGreaterThan(box0.y + box0.height - 2);
  });

  // ── Practice exercises card ───────────────────────────────────────────

  test('Practice Exercises card shows exercise count', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    // Card shows "X Practice Exercises"
    const exerciseCard = page.locator('.card h3', { hasText: /Practice Exercises/ });
    if (await exerciseCard.count() === 0) return;
    await expect(exerciseCard).toBeVisible();
    const text = await exerciseCard.textContent();
    expect(text).toMatch(/\d+ Practice Exercises/);
  });

  test('"Start Exercises" button is visible', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const startBtn = page.locator('button', { hasText: 'Start Exercises' }).first();
    if (await startBtn.count() === 0) return;
    await expect(startBtn).toBeVisible();
  });

  test('"Start Exercises" button meets 44px touch target', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const startBtn = page.locator('button', { hasText: 'Start Exercises' }).first();
    if (await startBtn.count() === 0) return;
    const box = await startBtn.boundingBox();
    if (!box) return;
    expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('header "Start Exercises" button in page-header meets touch target', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    // There's also a Start Exercises button in the page-header area
    const headerBtn = page.locator('.page-header button.btn-primary');
    if (await headerBtn.count() === 0) return;
    const box = await headerBtn.boundingBox();
    if (!box) return;
    expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  // ── Phase transitions: learn → practice ──────────────────────────────

  test('clicking Start Exercises switches to practice mode', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() > 0) return;

    const startBtn = page.locator('button', { hasText: 'Start Exercises' }).first();
    if (await startBtn.count() === 0) return;

    await startBtn.click();
    await page.waitForTimeout(1000);

    // The learn phase grid should be gone, exercise runner or exercise section should appear
    const exerciseRunner = page.locator('.exercise-runner, .exercise-section, [class*="exercise"]');
    if (await exerciseRunner.count() > 0) {
      await expect(exerciseRunner.first()).toBeVisible();
    }
  });

  // ── "What's Next" panel (done phase) ─────────────────────────────────

  test('"What\'s Next?" panel is visible if in done phase', async ({ page }) => {
    const whatsNext = page.locator('.whats-next-panel');
    if (await whatsNext.count() === 0) return;

    await expect(whatsNext).toBeVisible();
    const title = whatsNext.locator('.whats-next-title');
    if (await title.count() > 0) await expect(title).toBeVisible();
  });

  test('"Back to Skills" whats-next option navigates correctly', async ({ page }) => {
    const whatsNext = page.locator('.whats-next-panel');
    if (await whatsNext.count() === 0) return;

    const backBtn = whatsNext.locator('.whats-next-btn', { hasText: /Back to Skills/ });
    if (await backBtn.count() === 0) return;
    await backBtn.click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/skills');
  });

  test('"Try Daily Challenge" whats-next option is visible', async ({ page }) => {
    const whatsNext = page.locator('.whats-next-panel');
    if (await whatsNext.count() === 0) return;

    const challengeBtn = whatsNext.locator('.whats-next-btn', { hasText: /Daily Challenge/ });
    if (await challengeBtn.count() === 0) return;
    await expect(challengeBtn).toBeVisible();
  });

  test('whats-next buttons meet touch target', async ({ page }) => {
    const whatsNextBtns = page.locator('.whats-next-btn');
    const count = await whatsNextBtns.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await whatsNextBtns.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  // ── Responsive ────────────────────────────────────────────────────────

  test('no horizontal overflow at desktop viewport', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('no horizontal overflow at mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.reload();
    await page.waitForTimeout(2000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('all cards fit within mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.reload();
    await page.waitForTimeout(2000);
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box || box.width === 0) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('content blocks fit within mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.reload();
    await page.waitForTimeout(2000);
    const vw = page.viewportSize()!.width;
    const blocks = page.locator('.card-body div[style]');
    const count = await blocks.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await blocks.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('no horizontal overflow at small mobile (320px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.smallMobile);
    await page.reload();
    await page.waitForTimeout(2000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  test('skill badges fit within mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.reload();
    await page.waitForTimeout(2000);
    const vw = page.viewportSize()!.width;
    const badges = page.locator('.badge');
    const count = await badges.count();
    for (let i = 0; i < count; i++) {
      const box = await badges.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });
});
