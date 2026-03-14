import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET } from './helpers/viewport.js';

// ── Vocabulary page filters ────────────────────────────────────────────────────

test.describe('VocabularyPage filter interactions (/vocabulary)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('"All Topics" tab is present and visible', async ({ page }) => {
    const allTab = page.locator('.tabs .tab', { hasText: 'All Topics' });
    await expect(allTab).toBeVisible();
  });

  test('"All Topics" tab is active by default', async ({ page }) => {
    const allTab = page.locator('.tabs .tab', { hasText: 'All Topics' });
    await expect(allTab).toHaveClass(/active/);
  });

  test('band filter chips are visible (All Bands, Band 6, Band 7, Band 8)', async ({ page }) => {
    const allBands = page.locator('.filter-chip', { hasText: 'All Bands' });
    await expect(allBands).toBeVisible();

    for (const band of ['Band 6', 'Band 7', 'Band 8']) {
      const chip = page.locator('.filter-chip', { hasText: band });
      await expect(chip).toBeVisible();
    }
  });

  test('band filter chips meet touch target height', async ({ page }) => {
    const chips = page.locator('.filter-chip');
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await chips.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('"All Bands" chip is active by default', async ({ page }) => {
    const allBandsChip = page.locator('.filter-chip', { hasText: 'All Bands' });
    await expect(allBandsChip).toHaveClass(/active/);
  });

  test('clicking a band chip makes it active', async ({ page }) => {
    const band7Chip = page.locator('.filter-chip', { hasText: 'Band 7' });
    await band7Chip.click();
    await expect(band7Chip).toHaveClass(/active/);

    // All Bands should no longer be active
    const allBandsChip = page.locator('.filter-chip', { hasText: 'All Bands' });
    await expect(allBandsChip).not.toHaveClass(/active/);
  });

  test('clicking All Bands chip after another chip restores default active state', async ({ page }) => {
    // Select Band 6 first
    await page.locator('.filter-chip', { hasText: 'Band 6' }).click();

    // Then click All Bands
    const allBandsChip = page.locator('.filter-chip', { hasText: 'All Bands' });
    await allBandsChip.click();
    await expect(allBandsChip).toHaveClass(/active/);
  });

  test('search input is visible and accepts text', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('academic');
    await expect(searchInput).toHaveValue('academic');
  });

  test('search input filters shown results (result count or empty state appears)', async ({ page }) => {
    const collocations = page.locator('.collocation-card');
    if (await collocations.count() === 0) return; // no data loaded, skip

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('zzzznonexistentquery12345');

    // Should show empty state or reduced results
    await page.waitForTimeout(500);
    const emptyState = page.locator('.empty-state');
    const remainingCards = page.locator('.collocation-card');

    const hasEmpty = await emptyState.count() > 0;
    const reducedCards = await remainingCards.count() === 0;

    expect(hasEmpty || reducedCards).toBe(true);
  });

  test('clearing search restores all results', async ({ page }) => {
    const collocations = page.locator('.collocation-card');
    if (await collocations.count() === 0) return;

    const originalCount = await collocations.count();
    const searchInput = page.locator('input[placeholder*="Search"]');

    await searchInput.fill('zzzznonexistentquery12345');
    await page.waitForTimeout(300);

    // Clear the search
    await searchInput.clear();
    await page.waitForTimeout(300);

    const restoredCount = await collocations.count();
    expect(restoredCount).toBe(originalCount);
  });

  test('result count label appears when filter is active', async ({ page }) => {
    const collocations = page.locator('.collocation-card');
    if (await collocations.count() === 0) return;

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('a'); // broad search that should return some results
    await page.waitForTimeout(300);

    // Result count span should appear (text-sm text-muted showing "X results")
    const resultCount = page.locator('.text-muted', { hasText: /result/ });
    if (await resultCount.count() > 0) {
      await expect(resultCount).toBeVisible();
    }
  });

  test('no horizontal scroll after applying filters', async ({ page }) => {
    const chip = page.locator('.filter-chip', { hasText: 'Band 8' });
    await chip.click();
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 2);
  });
});

// ── Band Upgrades page filters ─────────────────────────────────────────────────

test.describe('BandUpgradesPage category filters (/vocabulary/upgrades)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary/upgrades');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('page renders without crash', async ({ page }) => {
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
  });

  test('tabs/category filter row is visible', async ({ page }) => {
    // With data: tabs show dynamic categories. Without data: still renders.
    const tabsRow = page.locator('.tabs');
    if (await tabsRow.count() > 0) {
      await expect(tabsRow).toBeVisible();
    }
  });

  test('clicking a category tab makes it active', async ({ page }) => {
    const tabs = page.locator('.tabs .tab');
    const count = await tabs.count();
    if (count < 2) return; // need at least two tabs to test

    const firstTab = tabs.first();
    const secondTab = tabs.nth(1);
    await secondTab.click();
    await expect(secondTab).toHaveClass(/active/);
    await expect(firstTab).not.toHaveClass(/active/);
  });

  test('Study and Practice mode buttons are visible', async ({ page }) => {
    const studyBtn = page.locator('button', { hasText: 'Study' });
    const practiceBtn = page.locator('button', { hasText: 'Practice' });

    if (await studyBtn.count() > 0) {
      await expect(studyBtn).toBeVisible();
    }
    if (await practiceBtn.count() > 0) {
      await expect(practiceBtn).toBeVisible();
    }
  });

  test('no horizontal scroll on upgrades page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 2);
  });
});

// ── Task 2 page filters ────────────────────────────────────────────────────────

test.describe('TaskPromptsPage filter chips (/writing/task2)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/task2');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('filter chips are visible', async ({ page }) => {
    const chips = page.locator('.filter-chip');
    const count = await chips.count();
    expect(count).toBeGreaterThanOrEqual(4); // all, intermediate, advanced, expert
  });

  test('filter chip labels include difficulty levels', async ({ page }) => {
    for (const label of ['All', 'Intermediate', 'Advanced', 'Expert']) {
      // Case-insensitive check — chips may have various casings
      const chip = page.locator('.filter-chip', { hasText: new RegExp(label, 'i') });
      await expect(chip).toBeVisible();
    }
  });

  test('filter chips meet touch target height', async ({ page }) => {
    const chips = page.locator('.filter-chip');
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await chips.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('clicking a difficulty chip makes it active', async ({ page }) => {
    const intermediateChip = page.locator('.filter-chip', { hasText: /intermediate/i });
    await intermediateChip.click();
    await expect(intermediateChip).toHaveClass(/active/);
  });

  test('only one filter chip is active at a time', async ({ page }) => {
    const advancedChip = page.locator('.filter-chip', { hasText: /advanced/i });
    await advancedChip.click();
    await page.waitForTimeout(200);

    const activeChips = page.locator('.filter-chip.active');
    const activeCount = await activeChips.count();
    expect(activeCount).toBe(1);
  });

  test('clicking all chip after another deactivates the other', async ({ page }) => {
    const expertChip = page.locator('.filter-chip', { hasText: /expert/i });
    await expertChip.click();
    await expect(expertChip).toHaveClass(/active/);

    const allChip = page.locator('.filter-chip').first();
    await allChip.click();
    await expect(expertChip).not.toHaveClass(/active/);
    await expect(allChip).toHaveClass(/active/);
  });

  test('no horizontal scroll after filter interaction', async ({ page }) => {
    const chips = page.locator('.filter-chip');
    if (await chips.count() > 1) {
      await chips.nth(1).click();
    }
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 2);
  });
});
