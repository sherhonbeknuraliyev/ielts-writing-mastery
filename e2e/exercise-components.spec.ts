import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE } from './helpers/viewport.js';

// ── DailyChallengePage (/daily-challenge) ────────────────────────────────────

test.describe('DailyChallengePage (/daily-challenge) — start phase', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/daily-challenge');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('page renders heading "Daily Challenge"', async ({ page }) => {
    const heading = page.locator('h1', { hasText: 'Daily Challenge' });
    await expect(heading).toBeVisible();
  });

  test('start card is visible', async ({ page }) => {
    const card = page.locator('.challenge-start');
    await expect(card).toBeVisible();
  });

  test('Start Challenge button (or disabled state) is visible in start card', async ({ page }) => {
    // Button shows "Start Challenge" when skills are loaded,
    // or "No skills loaded yet" (disabled) when API returns no data.
    const btn = page.locator('.challenge-start .btn-primary');
    await expect(btn).toBeVisible();
  });

  test('Start Challenge button meets 44px touch target', async ({ page }) => {
    const btn = page.locator('.challenge-start .btn-primary');
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height, 'Start Challenge button height < 44px').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('"How it works" list items are visible', async ({ page }) => {
    const listItems = page.locator('.challenge-start li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('no horizontal scroll on start screen', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 5);
  });
});

// ── ExerciseRunner — via daily challenge running phase ───────────────────────

async function startDailyChallenge(page: import('@playwright/test').Page): Promise<boolean> {
  const startBtn = page.locator('.challenge-start .btn-primary');
  await startBtn.waitFor({ state: 'visible', timeout: 10000 });
  const text = (await startBtn.textContent()) ?? '';
  if (!/start challenge/i.test(text)) {
    // Skills not loaded — cannot start challenge
    return false;
  }
  await startBtn.click();
  await page.waitForSelector('.exercise-section', { timeout: 8000 });
  return true;
}

test.describe('ExerciseRunner (daily-challenge running phase)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/daily-challenge');
    await page.waitForSelector('.challenge-start', { timeout: 10000 });

    const started = await startDailyChallenge(page);
    if (!started) {
      test.skip();
    }
  });

  test('exercise section is visible after starting', async ({ page }) => {
    const section = page.locator('.exercise-section');
    await expect(section).toBeVisible();
  });

  test('progress indicator shows exercise count', async ({ page }) => {
    const section = page.locator('.exercise-section');
    const text = await section.textContent();
    // Should contain "Exercise X of Y"
    expect(text).toMatch(/exercise\s+\d+\s+of\s+\d+/i);
  });

  test('exercise card is visible', async ({ page }) => {
    const card = page.locator('.exercise-card');
    await expect(card.first()).toBeVisible();
  });

  test('exercise card has question text', async ({ page }) => {
    const question = page.locator('.exercise-question');
    await expect(question.first()).toBeVisible();
    const text = await question.first().textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('answer input or textarea is visible', async ({ page }) => {
    const input = page.locator('.recall-input, .recall-sentence-area');
    await expect(input.first()).toBeVisible();
  });

  test('Check Answer button is visible and meets 44px touch target', async ({ page }) => {
    const checkBtn = page.locator('.exercise-section button', { hasText: /check answer/i });
    await expect(checkBtn).toBeVisible();

    const box = await checkBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height, 'Check Answer button < 44px').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('exercise type label has readable font size', async ({ page }) => {
    const label = page.locator('.exercise-number').first();
    if (await label.count() === 0) return;
    await expect(label).toBeVisible();

    const fontSize = await label.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });

  test('countdown timer is displayed during challenge', async ({ page }) => {
    // The DailyChallengePage shows a timer in the page header while running
    const timerEl = page.locator('.page-header').filter({ hasText: /\d+:\d{2}/ });
    const count = await timerEl.count();
    if (count === 0) {
      // Timer may be styled differently — look for any element with time pattern
      const body = await page.locator('body').textContent();
      expect(body).toMatch(/\d+:\d{2}/);
    } else {
      await expect(timerEl.first()).toBeVisible();
    }
  });

  test('exercise section does not overflow viewport', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 5);
  });
});

// ── ExerciseRunner — feedback states after submitting ────────────────────────

test.describe('ExerciseRunner — feedback after answer submission', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/daily-challenge');
    await page.waitForSelector('.challenge-start', { timeout: 10000 });

    const started = await startDailyChallenge(page);
    if (!started) {
      test.skip();
    }
  });

  test('submitting an answer reveals feedback or next-step button', async ({ page }) => {
    const input = page.locator('.recall-input, .recall-sentence-area').first();
    await input.fill('test answer for e2e exercise submission');

    const checkBtn = page.locator('.exercise-section button', { hasText: /check answer/i });
    await checkBtn.click();
    await page.waitForTimeout(500);

    // After submit: either auto-feedback, self-rate panel, or Next/Finish button
    const feedback = page.locator('.exercise-feedback');
    const selfRate = page.locator('.self-rate-panel');
    const nextBtn = page.locator('.exercise-section button', { hasText: /next exercise|finish/i });

    const hasFeedback = await feedback.count() > 0;
    const hasSelfRate = await selfRate.count() > 0;
    const hasNext = await nextBtn.count() > 0;

    expect(hasFeedback || hasSelfRate || hasNext, 'No post-submit UI shown').toBe(true);
  });

  test('feedback element has distinct styling class', async ({ page }) => {
    const input = page.locator('.recall-input, .recall-sentence-area').first();
    await input.fill('some answer text here');

    const checkBtn = page.locator('.exercise-section button', { hasText: /check answer/i });
    await checkBtn.click();
    await page.waitForTimeout(500);

    const feedback = page.locator('.exercise-feedback');
    if (await feedback.count() === 0) return;

    // Should have either feedback-correct or feedback-incorrect class
    const cls = await feedback.first().getAttribute('class');
    expect(cls).toMatch(/feedback-(correct|incorrect)/);
  });

  test('self-rate buttons (when visible) meet 44px touch target', async ({ page }) => {
    const input = page.locator('.recall-input, .recall-sentence-area').first();
    await input.fill('a paraphrase or rewrite answer');

    const checkBtn = page.locator('.exercise-section button', { hasText: /check answer/i });
    await checkBtn.click();
    await page.waitForTimeout(500);

    const selfRateBtns = page.locator('.self-rate-btn');
    const count = await selfRateBtns.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await selfRateBtns.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height, `Self-rate button #${i} height < 44px`).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('answer comparison layout (when visible) fits within viewport', async ({ page }) => {
    const input = page.locator('.recall-input, .recall-sentence-area').first();
    await input.fill('rewrite or transform answer text');

    const checkBtn = page.locator('.exercise-section button', { hasText: /check answer/i });
    await checkBtn.click();
    await page.waitForTimeout(500);

    const comparison = page.locator('.answer-comparison');
    if (await comparison.count() === 0) return;

    const box = await comparison.first().boundingBox();
    if (!box) return;

    const vw = page.viewportSize()!.width;
    expect(box.x + box.width, 'Answer comparison overflows viewport').toBeLessThanOrEqual(vw + 5);
  });
});

// ── ExerciseSection — via SkillDetailPage ────────────────────────────────────

test.describe('ExerciseSection (SkillDetailPage /skills/:id)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/skills/test-skill-id');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('page shows loading, error, or skill content', async ({ page }) => {
    const spinner = page.locator('.loading-state');
    const errorState = page.locator('.error-state');
    const skillContent = page.locator('h1, .lesson-content, .exercise-section');

    const has = await Promise.any([
      spinner.waitFor({ state: 'visible', timeout: 3000 }).then(() => true),
      errorState.waitFor({ state: 'visible', timeout: 3000 }).then(() => true),
      skillContent.first().waitFor({ state: 'visible', timeout: 3000 }).then(() => true),
    ]).catch(() => false);

    expect(has).toBe(true);
  });

  test('exercise buttons (when visible) meet 44px touch target', async ({ page }) => {
    const btns = page.locator('.exercise-section button, .exercise-runner button');
    const count = await btns.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await btns.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height, `Exercise button #${i} < 44px`).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('exercise progress indicator (when visible) has readable text', async ({ page }) => {
    const progress = page.locator('.exercise-section').filter({ hasText: /exercise \d+ of \d+/i });
    if (await progress.count() === 0) return;

    const fontSize = await progress.first().evaluate(
      (el) => {
        // Find the span with the progress text
        const spans = el.querySelectorAll('span');
        for (const span of spans) {
          if (/exercise \d+ of \d+/i.test(span.textContent ?? '')) {
            return parseFloat(getComputedStyle(span).fontSize);
          }
        }
        return parseFloat(getComputedStyle(el).fontSize);
      },
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });

  test('no horizontal scroll on skill detail page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 5);
  });
});
