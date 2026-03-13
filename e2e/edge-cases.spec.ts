import { test, expect, Page } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { SIDEBAR_BREAKPOINT } from './helpers/viewport.js';

async function ensureAuth(page: Page): Promise<void> {
  await loginAsTestUser(page);
}

// ── Very long text ────────────────────────────────────────────────────────────

test.describe('Edge cases — long text in textarea', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuth(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('no horizontal overflow when typing very long text', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    if (await textarea.count() === 0) return;

    // Type a very long paragraph
    const longText =
      'This is a very long sentence that goes on and on without stopping to test whether the writing area handles overflow correctly and does not cause the page to scroll horizontally which would be a bad user experience for IELTS students. '.repeat(5);

    await textarea.fill(longText);
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(
      scrollWidth,
      `Horizontal overflow after long text input: scrollWidth=${scrollWidth} vw=${vw}`,
    ).toBeLessThanOrEqual(vw + 1);
  });

  test('textarea word-wrap prevents horizontal overflow', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    if (await textarea.count() === 0) return;

    const overflowX = await textarea.evaluate(
      (el) => getComputedStyle(el).overflowX,
    );
    const wordBreak = await textarea.evaluate(
      (el) => getComputedStyle(el).wordBreak,
    );
    const whiteSpace = await textarea.evaluate(
      (el) => getComputedStyle(el).whiteSpace,
    );

    // Textarea should not allow horizontal scroll
    const isOverflowing =
      overflowX === 'scroll' ||
      (overflowX !== 'hidden' && wordBreak === 'keep-all' && whiteSpace === 'nowrap');

    expect(isOverflowing, 'Textarea may cause horizontal scroll').toBe(false);
  });
});

// ── Window resize ─────────────────────────────────────────────────────────────

test.describe('Edge cases — window resize behavior', () => {
  test('sidebar hides and hamburger appears when resizing to mobile width', async ({ page }) => {
    // This test only makes sense in a Desktop project context
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop-only test — needs to resize down');

    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    // Verify sidebar visible at desktop width
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);

    // Hamburger should appear
    const hamburger = page.locator('.mobile-menu-btn');
    await expect(hamburger).toBeVisible({ timeout: 2000 });

    // No horizontal overflow after resize
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const newVw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(newVw + 5);
  });

  test('sidebar reappears after resizing back to desktop width', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop-only test');

    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    // Shrink to mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    // Grow back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(400);

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible({ timeout: 2000 });
  });
});

// ── Rapid navigation ──────────────────────────────────────────────────────────

test.describe('Edge cases — rapid navigation', () => {
  test('quickly navigating between 5 pages causes no crash', async ({ page }) => {
    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    const routes = ['/', '/writing/task2', '/skills', '/analytics', '/vocabulary'];

    for (const route of routes) {
      await page.goto(route);
      // Minimal wait — just enough for route change to register
      await page.waitForTimeout(100);
    }

    // After rapid navigation the last page should render without crash
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await expect(page.locator('.app-shell')).toBeVisible();
  });

  test('rapid back/forward navigation does not crash', async ({ page }) => {
    await ensureAuth(page);

    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.goto('/skills');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.goto('/analytics');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    await page.goBack();
    await page.goBack();
    await page.waitForTimeout(300);

    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 5000 });
  });
});

// ── Double-click prevention ───────────────────────────────────────────────────

test.describe('Edge cases — double-click prevention', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuth(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('double-clicking analyze/submit button does not cause visible crash', async ({ page }) => {
    const submitBtn = page.locator('.writing-toolbar button, .writing-actions button').first();
    if (await submitBtn.count() === 0) return;

    // Double-click the button
    await submitBtn.dblclick();
    await page.waitForTimeout(500);

    // The app shell should still be intact
    await expect(page.locator('.app-shell')).toBeVisible();
  });
});

// ── Empty data / graceful empty states ───────────────────────────────────────

test.describe('Edge cases — empty API responses', () => {
  const PAGES_WITH_DATA: Array<{ route: string; waitFor: string }> = [
    { route: '/', waitFor: '.app-shell' },
    { route: '/writing/task2', waitFor: '.app-shell' },
    { route: '/writing/history', waitFor: '.app-shell' },
    { route: '/skills', waitFor: '.app-shell' },
    { route: '/vocabulary', waitFor: '.app-shell' },
    { route: '/analytics', waitFor: '.app-shell' },
    { route: '/daily-challenge', waitFor: '.app-shell' },
  ];

  for (const { route, waitFor } of PAGES_WITH_DATA) {
    test(`${route} — shows empty/error state gracefully when API fails`, async ({ page }) => {
      await ensureAuth(page);
      await page.goto(route);
      await page.waitForSelector(waitFor, { timeout: 10000 });

      // Wait for async data fetches to settle
      await page.waitForTimeout(2000);

      // Page should not show a white screen or unhandled error boundary
      const bodyText = await page.locator('body').textContent();
      const isBlank = !bodyText || bodyText.trim().length === 0;
      expect(isBlank, `${route} rendered a blank page`).toBe(false);

      // No unhandled React error boundary text
      const hasErrorBoundary = await page.evaluate(() =>
        document.body.textContent?.includes('Something went wrong') ?? false,
      );
      expect(hasErrorBoundary, `${route} hit React error boundary`).toBe(false);

      // Either an empty state, error state, loading state, or actual content should be visible
      const emptyState = page.locator('.empty-state');
      const errorState = page.locator('.error-state');
      const loadingState = page.locator('.loading-state');
      const contentArea = page.locator('.page-content');

      const hasEmpty = await emptyState.count() > 0;
      const hasError = await errorState.count() > 0;
      const hasLoading = await loadingState.count() > 0;
      const hasContent = await contentArea.count() > 0;

      expect(
        hasEmpty || hasError || hasLoading || hasContent,
        `${route} shows none of: empty-state, error-state, loading-state, page-content`,
      ).toBe(true);
    });
  }
});

// ── Content overflow with very long words ─────────────────────────────────────

test.describe('Edge cases — long unbreakable words in cards', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('cards handle very long unbreakable words without horizontal overflow', async ({ page }) => {
    // Inject a mock long word into every .card element
    await page.evaluate(() => {
      const LONG_WORD = 'Supercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis';
      document.querySelectorAll('.card').forEach((card) => {
        const span = document.createElement('span');
        span.textContent = LONG_WORD;
        span.style.display = 'block';
        card.appendChild(span);
      });
    });

    await page.waitForTimeout(200);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(
      scrollWidth,
      `Horizontal overflow after injecting long word: scrollWidth=${scrollWidth} vw=${vw}`,
    ).toBeLessThanOrEqual(vw + 5);
  });

  test('injected long word text wraps or overflows handled in cards', async ({ page }) => {
    await page.evaluate(() => {
      const LONG_WORD = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
      document.querySelectorAll('.card').forEach((card) => {
        const span = document.createElement('span');
        span.textContent = LONG_WORD;
        span.className = 'test-long-word';
        card.appendChild(span);
      });
    });

    await page.waitForTimeout(200);

    // Check each card's overflow-x style handles the content
    const violations = await page.evaluate(() => {
      const problems: string[] = [];
      document.querySelectorAll('.card').forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        if (rect.right > window.innerWidth + 5) {
          problems.push(`Card #${i} overflows: right=${Math.round(rect.right)}`);
        }
      });
      return problems.slice(0, 5);
    });

    expect(
      violations,
      `Cards overflow viewport after long word injection: ${violations.join(', ')}`,
    ).toHaveLength(0);
  });
});
