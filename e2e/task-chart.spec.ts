import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_FONT_SIZE } from './helpers/viewport.js';

// TaskChart appears on writing practice pages with Task 1 prompts (which have chartData).
// On /writing/task1 the prompt list is shown first; the chart appears after selecting a prompt.
// On /writing/free there is no chart.
// We test the chart container on any page that has a .chart-container present.

test.describe('TaskChart — container and dimensions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // task1 prompts may have charts; navigate and wait for page
    await page.goto('/writing/task1');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('page renders without crashing on task1', async ({ page }) => {
    // Should show loading, error, empty, or actual content
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
  });

  test('chart container (when present) has non-zero dimensions', async ({ page }) => {
    const chart = page.locator('.chart-container');
    if (await chart.count() === 0) return;

    const box = await chart.first().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width, 'Chart container has zero width').toBeGreaterThan(0);
    expect(box!.height, 'Chart container has zero height').toBeGreaterThan(0);
  });

  test('chart container fits within viewport width', async ({ page }) => {
    const chart = page.locator('.chart-container');
    if (await chart.count() === 0) return;

    const box = await chart.first().boundingBox();
    if (!box) return;

    const vw = page.viewportSize()!.width;
    expect(box.x + box.width, 'Chart overflows viewport').toBeLessThanOrEqual(vw + 5);
  });

  test('chart title (h3) is visible when chart is present', async ({ page }) => {
    const chart = page.locator('.chart-container');
    if (await chart.count() === 0) return;

    const title = chart.first().locator('h3');
    await expect(title).toBeVisible();
    const text = await title.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('chart title font size is readable', async ({ page }) => {
    const chart = page.locator('.chart-container');
    if (await chart.count() === 0) return;

    const title = chart.first().locator('h3');
    if (await title.count() === 0) return;

    const fontSize = await title.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });

  test('chart wrapper element has non-trivial height', async ({ page }) => {
    const wrapper = page.locator('.chart-wrapper');
    if (await wrapper.count() === 0) return;

    const box = await wrapper.first().boundingBox();
    if (!box) return;

    expect(box.height, 'Chart wrapper too short').toBeGreaterThan(50);
  });

  test('chart SVG or table element is rendered inside wrapper', async ({ page }) => {
    const wrapper = page.locator('.chart-wrapper');
    if (await wrapper.count() === 0) return;

    // Recharts renders SVG; table chart renders <table>
    const svg = wrapper.first().locator('svg');
    const table = wrapper.first().locator('table.data-table');
    const processDiagram = wrapper.first().locator('.process-diagram');

    const hasSvg = await svg.count() > 0;
    const hasTable = await table.count() > 0;
    const hasProcess = await processDiagram.count() > 0;

    expect(hasSvg || hasTable || hasProcess, 'No chart content rendered').toBe(true);
  });

  test('no horizontal scroll caused by chart', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 5);
  });
});

test.describe('TaskChart — table variant structural checks', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/task1');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('data table (when rendered) has thead and tbody', async ({ page }) => {
    const table = page.locator('.chart-wrapper table.data-table');
    if (await table.count() === 0) return;

    const thead = table.first().locator('thead');
    const tbody = table.first().locator('tbody');

    await expect(thead).toBeVisible();
    await expect(tbody).toBeVisible();
  });

  test('data table cells have readable font size', async ({ page }) => {
    const cells = page.locator('.chart-wrapper table.data-table td, .chart-wrapper table.data-table th');
    const count = await cells.count();
    if (count === 0) return;

    for (let i = 0; i < Math.min(count, 10); i++) {
      const fontSize = await cells.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).fontSize),
      );
      expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
    }
  });
});

test.describe('TaskChart — process diagram structural checks', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/task1');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('process diagram steps (when rendered) fit within viewport', async ({ page }) => {
    const steps = page.locator('.process-step');
    const count = await steps.count();
    if (count === 0) return;

    const vw = page.viewportSize()!.width;
    for (let i = 0; i < count; i++) {
      const box = await steps.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width, `Process step #${i} overflows`).toBeLessThanOrEqual(vw + 5);
    }
  });
});

// ── Chart on writing practice page (when a task1 prompt is opened) ────────────

test.describe('TaskChart — on writing practice page with chart', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // Navigate directly to a writing practice session — chartData only appears
    // when a Task 1 prompt is loaded. With fake token the prompt API will fail,
    // so the chart won't render. We test structural fallback here.
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('no chart-container on free writing (no chartData)', async ({ page }) => {
    // Free practice never has chartData, so .chart-container should not appear
    const chart = page.locator('.chart-container');
    expect(await chart.count()).toBe(0);
  });

  test('page does not overflow horizontally', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 5);
  });
});
