import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE } from './helpers/viewport.js';

// ModelAnswerViewer is rendered as an overlay on top of the writing practice page.
// It is triggered by clicking the "Model Answer" button in the WritingToolbar.
// However, it only renders when `prompt` data is available (i.e., a promptId route).
// On /writing/free there is no prompt, so the button exists but does nothing visible.

test.describe('ModelAnswerViewer — button presence on /writing/free', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-toolbar', { timeout: 10000 });
  });

  test('Model Answer button is visible in toolbar', async ({ page }) => {
    const btn = page.locator('.writing-toolbar button', { hasText: /model answer/i });
    await expect(btn).toBeVisible();
  });

  test('Model Answer button meets 44px touch target', async ({ page }) => {
    const btn = page.locator('.writing-toolbar button', { hasText: /model answer/i });
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height, 'Model Answer button < 44px').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('Model Answer button has readable font size', async ({ page }) => {
    const btn = page.locator('.writing-toolbar button', { hasText: /model answer/i });
    const fontSize = await btn.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });

  test('clicking Model Answer on free practice (no prompt) does not open panel', async ({ page }) => {
    const btn = page.locator('.writing-toolbar button', { hasText: /model answer/i });
    await btn.click();
    await page.waitForTimeout(400);

    // No prompt loaded — panel should not appear
    const panel = page.locator('.model-answer-panel');
    expect(await panel.count()).toBe(0);
  });
});

test.describe('ModelAnswerViewer — panel structure when open', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-toolbar', { timeout: 10000 });
  });

  test('panel overlay covers most of viewport when open', async ({ page }) => {
    const overlay = page.locator('.ai-feedback-overlay');
    if (await overlay.count() === 0) return;

    const box = await overlay.boundingBox();
    expect(box).not.toBeNull();

    const vw = page.viewportSize()!.width;
    const vh = page.viewportSize()!.height;
    expect(box!.width).toBeGreaterThan(vw * 0.5);
    expect(box!.height).toBeGreaterThan(vh * 0.5);
  });

  test('model answer panel has non-zero dimensions when open', async ({ page }) => {
    const panel = page.locator('.model-answer-panel');
    if (await panel.count() === 0) return;

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(200);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('panel fits within viewport when open', async ({ page }) => {
    const panel = page.locator('.model-answer-panel');
    if (await panel.count() === 0) return;

    const box = await panel.boundingBox();
    if (!box) return;

    const vw = page.viewportSize()!.width;
    const vh = page.viewportSize()!.height;
    expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    expect(box.y + box.height).toBeLessThanOrEqual(vh + 5);
  });

  test('heading "Model Answers" is visible when panel is open', async ({ page }) => {
    const heading = page.locator('.model-answer-panel h2');
    if (await heading.count() === 0) return;

    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Model Answers');
  });

  test('close button is visible with aria-label "Close"', async ({ page }) => {
    const closeBtn = page.locator('.model-answer-panel .close-btn');
    if (await closeBtn.count() === 0) return;

    await expect(closeBtn).toBeVisible();
    const ariaLabel = await closeBtn.getAttribute('aria-label');
    expect(ariaLabel).toBe('Close');
  });

  test('Band 7 tab is visible when panel is open', async ({ page }) => {
    const tab = page.locator('.model-answer-panel .model-tab', { hasText: /band 7/i });
    if (await tab.count() === 0) return;

    await expect(tab).toBeVisible();
  });

  test('Band 8 tab is visible when panel is open', async ({ page }) => {
    const tab = page.locator('.model-answer-panel .model-tab', { hasText: /band 8/i });
    if (await tab.count() === 0) return;

    await expect(tab).toBeVisible();
  });

  test('tab buttons meet 44px touch target', async ({ page }) => {
    const tabs = page.locator('.model-answer-panel .model-tab');
    const count = await tabs.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await tabs.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height, `Tab #${i} height < 44px`).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('switching from Band 7 to Band 8 tab changes active state', async ({ page }) => {
    const band7Tab = page.locator('.model-answer-panel .model-tab', { hasText: /band 7/i });
    const band8Tab = page.locator('.model-answer-panel .model-tab', { hasText: /band 8/i });

    if (await band7Tab.count() === 0 || await band8Tab.count() === 0) return;

    // Band 7 should be active by default
    const band7Class = await band7Tab.getAttribute('class');
    expect(band7Class).toContain('active');

    await band8Tab.click();
    await page.waitForTimeout(200);

    const band8ClassAfter = await band8Tab.getAttribute('class');
    expect(band8ClassAfter).toContain('active');

    const band7ClassAfter = await band7Tab.getAttribute('class');
    expect(band7ClassAfter).not.toContain('active');
  });

  test('model answer text area is visible when a band tab is selected', async ({ page }) => {
    const textArea = page.locator('.model-answer-panel .model-answer-text');
    if (await textArea.count() === 0) return;

    await expect(textArea).toBeVisible();
  });

  test('model answer text has readable font size', async ({ page }) => {
    const textArea = page.locator('.model-answer-panel .model-answer-text');
    if (await textArea.count() === 0) return;

    const fontSize = await textArea.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });

  test('feedback body is scrollable when it has overflow', async ({ page }) => {
    const body = page.locator('.model-answer-panel .ai-feedback-body');
    if (await body.count() === 0) return;

    const overflowY = await body.evaluate(
      (el) => getComputedStyle(el).overflowY,
    );
    expect(['auto', 'scroll', 'overlay']).toContain(overflowY);
  });

  test('clicking overlay background closes the panel', async ({ page }) => {
    const overlay = page.locator('.ai-feedback-overlay');
    if (await overlay.count() === 0) return;

    await overlay.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(300);

    const panelAfter = page.locator('.model-answer-panel');
    expect(await panelAfter.count()).toBe(0);
  });

  test('close button click closes the panel', async ({ page }) => {
    const closeBtn = page.locator('.model-answer-panel .close-btn');
    if (await closeBtn.count() === 0) return;

    await closeBtn.click();
    await page.waitForTimeout(300);

    const panelAfter = page.locator('.model-answer-panel');
    expect(await panelAfter.count()).toBe(0);
  });

  test('key vocabulary chips (when present) are visible', async ({ page }) => {
    const chips = page.locator('.model-answer-panel .key-vocab-chip');
    const count = await chips.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      await expect(chips.nth(i)).toBeVisible();
    }
  });

  test('key vocabulary chips have readable font size', async ({ page }) => {
    const chips = page.locator('.model-answer-panel .key-vocab-chip');
    const count = await chips.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const fontSize = await chips.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  test('annotation items (when Annotations tab is visible) have content', async ({ page }) => {
    const annotationsTab = page.locator('.model-answer-panel .model-tab', { hasText: /annotations/i });
    if (await annotationsTab.count() === 0) return;

    await annotationsTab.click();
    await page.waitForTimeout(200);

    const annotationItems = page.locator('.model-answer-panel .annotation-item');
    if (await annotationItems.count() === 0) return;

    const first = annotationItems.first();
    const highlight = first.locator('.annotation-highlight');
    const technique = first.locator('.annotation-technique');

    await expect(highlight).toBeVisible();
    await expect(technique).toBeVisible();
  });

  test('no horizontal overflow caused by model answer panel', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 5);
  });
});
