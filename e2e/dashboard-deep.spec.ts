import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE, VIEWPORTS } from './helpers/viewport.js';

test.describe('DashboardPage deep tests (/)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  // ── Welcome heading ───────────────────────────────────────────────────

  test('welcome heading contains user first name', async ({ page }) => {
    const welcome = page.locator('.dashboard-welcome h1');
    await expect(welcome).toBeVisible();
    await expect(welcome).toContainText('Test');
  });

  test('welcome heading has large readable font', async ({ page }) => {
    const welcome = page.locator('.dashboard-welcome h1');
    const fontSize = await welcome.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(24);
  });

  test('welcome subtext is visible and non-empty', async ({ page }) => {
    const sub = page.locator('.dashboard-welcome p');
    await expect(sub).toBeVisible();
    const text = await sub.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('welcome subtext is readable font size', async ({ page }) => {
    const sub = page.locator('.dashboard-welcome p');
    const fontSize = await sub.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });

  // ── Quick action buttons ──────────────────────────────────────────────

  test('quick action buttons are all visible with labels', async ({ page }) => {
    const buttons = page.locator('.quick-action-btn');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeVisible();
      const text = await buttons.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('primary quick action button has .primary class', async ({ page }) => {
    const primaryBtn = page.locator('.quick-action-btn.primary');
    await expect(primaryBtn).toBeVisible();
  });

  test('primary quick action button is visually distinct (has different background)', async ({ page }) => {
    const primaryBtn = page.locator('.quick-action-btn.primary');
    const regularBtn = page.locator('.quick-action-btn:not(.primary)').first();
    if (await regularBtn.count() === 0) return;

    const primaryBg = await primaryBtn.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    const regularBg = await regularBtn.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(primaryBg).not.toBe(regularBg);
  });

  test('all quick action buttons meet 44px touch target', async ({ page }) => {
    const buttons = page.locator('.quick-action-btn');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('clicking primary quick action navigates to writing task 2', async ({ page }) => {
    const primaryBtn = page.locator('.quick-action-btn.primary');
    await primaryBtn.click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/writing/task2');
  });

  test('clicking Skills quick action navigates to /skills', async ({ page }) => {
    const skillsBtn = page.locator('.quick-action-btn', { hasText: /Sentence Structure|Skills/i });
    if (await skillsBtn.count() === 0) return;
    await skillsBtn.first().click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/skills');
  });

  test('clicking Vocabulary quick action navigates to /vocabulary', async ({ page }) => {
    const vocabBtn = page.locator('.quick-action-btn', { hasText: /Vocabulary/i });
    if (await vocabBtn.count() === 0) return;
    await vocabBtn.first().click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/vocabulary');
  });

  // ── Stat cards ────────────────────────────────────────────────────────

  test('stat cards are rendered with values and labels', async ({ page }) => {
    const cards = page.locator('.stat-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toBeVisible();

      const value = cards.nth(i).locator('.stat-value');
      const label = cards.nth(i).locator('.stat-label');
      if (await value.count() > 0) await expect(value).toBeVisible();
      if (await label.count() > 0) await expect(label).toBeVisible();
    }
  });

  test('stat values have larger font than labels', async ({ page }) => {
    const values = page.locator('.stat-value');
    const labels = page.locator('.stat-label');
    if (await values.count() === 0 || await labels.count() === 0) return;

    const valueFont = await values.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    const labelFont = await labels.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(valueFont).toBeGreaterThan(labelFont);
  });

  test('stat card icons are visible', async ({ page }) => {
    const icons = page.locator('.stat-icon');
    const count = await icons.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      await expect(icons.nth(i)).toBeVisible();
    }
  });

  test('stat cards fit within viewport width', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    const cards = page.locator('.stat-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  test('stat card labels have readable font size', async ({ page }) => {
    const labels = page.locator('.stat-label');
    const count = await labels.count();
    if (count === 0) return;
    for (let i = 0; i < count; i++) {
      const fontSize = await labels.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });

  // ── Criterion score cards (when AI bands available) ───────────────────

  test('criterion cards render with score and label if available', async ({ page }) => {
    const criterionCards = page.locator('.criterion-card');
    if (await criterionCards.count() === 0) return;

    const count = await criterionCards.count();
    for (let i = 0; i < count; i++) {
      await expect(criterionCards.nth(i)).toBeVisible();
      const score = criterionCards.nth(i).locator('.criterion-card-score');
      const label = criterionCards.nth(i).locator('.criterion-card-label');
      if (await score.count() > 0) await expect(score).toBeVisible();
      if (await label.count() > 0) await expect(label).toBeVisible();
    }
  });

  test('criterion card scores have large font', async ({ page }) => {
    const scores = page.locator('.criterion-card-score');
    if (await scores.count() === 0) return;

    const count = await scores.count();
    for (let i = 0; i < count; i++) {
      const fontSize = await scores.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(20);
    }
  });

  // ── Recent writings ───────────────────────────────────────────────────

  test('"Recent Writings" section title is visible', async ({ page }) => {
    const sectionTitle = page.locator('.section-title', { hasText: 'Recent Writings' });
    await expect(sectionTitle).toBeVisible();
  });

  test('recent writings empty state or writing cards are shown', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    const writingCards = page.locator('.grid-auto .card');

    const hasEmpty = await emptyState.count() > 0;
    const hasCards = await writingCards.count() > 0;
    expect(hasEmpty || hasCards).toBe(true);
  });

  test('empty state CTA button meets 44px touch target', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() === 0) return;

    const ctaBtn = emptyState.first().locator('.btn-primary');
    if (await ctaBtn.count() === 0) return;
    const box = await ctaBtn.boundingBox();
    if (!box) return;
    expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('writing cards (if present) show badge and word count', async ({ page }) => {
    const writingCards = page.locator('.grid-auto .card');
    if (await writingCards.count() === 0) return;

    const firstCard = writingCards.first();
    const badge = firstCard.locator('.badge');
    if (await badge.count() > 0) await expect(badge).toBeVisible();

    const writingStats = firstCard.locator('.writing-stat');
    if (await writingStats.count() > 0) {
      await expect(writingStats.first()).toBeVisible();
    }
  });

  // ── Band descriptor collapsible ───────────────────────────────────────

  test('Band Descriptor Reference card header is visible', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await expect(header).toBeVisible();
  });

  test('Band Descriptor shows "▼ Show" toggle when collapsed', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await expect(header).toContainText('Show');
  });

  test('clicking Band Descriptor header expands it', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await header.click();

    const descriptorBlocks = page.locator('.descriptor-block');
    await expect(descriptorBlocks.first()).toBeVisible({ timeout: 3000 });
  });

  test('expanded Band Descriptor shows "▲ Hide" toggle', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await header.click();
    await expect(header).toContainText('Hide');
  });

  test('expanded Band Descriptor shows Band 6, 7, 8 rows', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await header.click();
    await page.waitForTimeout(500);

    const band6 = page.locator('.badge-warning', { hasText: 'Band 6' }).first();
    const band7 = page.locator('.badge-primary', { hasText: 'Band 7' }).first();
    const band8 = page.locator('.badge-success', { hasText: 'Band 8' }).first();

    if (await band6.count() > 0) await expect(band6).toBeVisible();
    if (await band7.count() > 0) await expect(band7).toBeVisible();
    if (await band8.count() > 0) await expect(band8).toBeVisible();
  });

  test('clicking Band Descriptor header again collapses it', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await header.click();
    await page.waitForTimeout(300);
    await header.click();
    await page.waitForTimeout(300);

    const descriptorBlocks = page.locator('.descriptor-block');
    if (await descriptorBlocks.count() === 0) return;
    await expect(descriptorBlocks.first()).not.toBeVisible();
  });

  test('descriptor blocks fit within viewport', async ({ page }) => {
    const header = page.locator('.card-header', { hasText: 'Band Descriptor Reference' });
    await header.click();
    await page.waitForTimeout(500);

    const vw = page.viewportSize()!.width;
    const blocks = page.locator('.descriptor-block');
    const count = await blocks.count();
    for (let i = 0; i < count; i++) {
      const box = await blocks.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });

  // ── Continue where left off (conditional) ────────────────────────────

  test('continue section renders if last skill is tracked', async ({ page }) => {
    const continueSection = page.locator('.continue-section');
    if (await continueSection.count() === 0) return;

    await expect(continueSection).toBeVisible();
    const title = continueSection.locator('.section-title');
    if (await title.count() > 0) {
      await expect(title).toBeVisible();
    }
  });

  // ── No horizontal overflow ────────────────────────────────────────────

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

  test('stat cards collapse to single column on small mobile (320px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.smallMobile);
    await page.reload();
    await page.waitForTimeout(2000);

    const cards = page.locator('.stat-card');
    const count = await cards.count();
    if (count < 2) return;

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    if (!box0 || !box1) return;

    // On small screen second card should be below first
    expect(box1.y).toBeGreaterThanOrEqual(box0.y + box0.height - 2);
  });

  test('quick action buttons fit within mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.reload();
    await page.waitForTimeout(2000);
    const vw = page.viewportSize()!.width;
    const buttons = page.locator('.quick-action-btn');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 5);
    }
  });
});
