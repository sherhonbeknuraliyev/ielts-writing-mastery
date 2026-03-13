import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, SIDEBAR_WIDTH, SIDEBAR_BREAKPOINT } from './helpers/viewport.js';

test.describe('Application layout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    // Wait for the app shell to render
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  // ── Sidebar visibility ─────────────────────────────────────────────────

  test('sidebar is visible on desktop (1280px)', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop-only test');

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('sidebar has correct width on desktop', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop-only test');

    const sidebar = page.locator('.sidebar');
    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    // Allow ±5px tolerance
    expect(box!.width).toBeGreaterThanOrEqual(SIDEBAR_WIDTH - 5);
    expect(box!.width).toBeLessThanOrEqual(SIDEBAR_WIDTH + 5);
  });

  test('mobile menu button is visible on small screens', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    const hamburger = page.locator('.mobile-menu-btn');
    await expect(hamburger).toBeVisible();
  });

  test('mobile menu button meets 44px touch target', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    const hamburger = page.locator('.mobile-menu-btn');
    await expect(hamburger).toBeVisible();
    const box = await hamburger.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('mobile menu button has aria-label', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    const hamburger = page.locator('.mobile-menu-btn');
    await expect(hamburger).toHaveAttribute('aria-label', 'Open menu');
  });

  // ── Mobile sidebar open/close ─────────────────────────────────────────

  test('sidebar opens when hamburger is clicked on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    const hamburger = page.locator('.mobile-menu-btn');
    await hamburger.click();

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toHaveClass(/open/);
  });

  test('sidebar overlay appears when menu is open on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    const hamburger = page.locator('.mobile-menu-btn');
    await hamburger.click();

    const overlay = page.locator('.sidebar-overlay');
    await expect(overlay).toHaveClass(/open/);
  });

  test('sidebar closes when overlay is clicked on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    await page.locator('.mobile-menu-btn').click();

    const overlay = page.locator('.sidebar-overlay');
    await overlay.click();

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toHaveClass(/open/);
  });

  // ── Nav items ─────────────────────────────────────────────────────────

  test('all nav section labels are visible in the sidebar', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const sidebar = page.locator('.sidebar');
    await expect(sidebar.locator('.nav-section-label').first()).toBeVisible();

    const labels = await sidebar.locator('.nav-section-label').allTextContents();
    expect(labels).toContain('Writing');
    expect(labels).toContain('Analytics');
    expect(labels).toContain('Skills');
    expect(labels).toContain('Vocabulary');
    expect(labels).toContain('Practice');
  });

  test('nav items each have at least 44px height (touch target)', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const navItems = page.locator('.sidebar .nav-item');
    const count = await navItems.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await navItems.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('nav items do not overlap each other', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const navItems = page.locator('.sidebar .nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count - 1; i++) {
      const boxA = await navItems.nth(i).boundingBox();
      const boxB = await navItems.nth(i + 1).boundingBox();
      if (!boxA || !boxB) continue;
      // B should start at or below A's bottom
      expect(boxB.y).toBeGreaterThanOrEqual(boxA.y + boxA.height - 2);
    }
  });

  // ── Sidebar footer ────────────────────────────────────────────────────

  test('sidebar footer is visible and contains user name', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const footer = page.locator('.sidebar-footer');
    await expect(footer).toBeVisible();

    const userName = footer.locator('.sidebar-user-name');
    await expect(userName).toBeVisible();
    await expect(userName).toContainText('Test');
  });

  test('theme toggle button in sidebar footer has aria-label and meets touch target', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const themeBtn = page.locator('.sidebar-footer button[aria-label="Toggle theme"]');
    await expect(themeBtn).toBeVisible();
    const box = await themeBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('sign-out button is visible in sidebar footer', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const logoutBtn = page.locator('.sidebar-logout-btn');
    await expect(logoutBtn).toBeVisible();
    await expect(logoutBtn).toContainText('Sign out');
  });

  // ── Main content area ─────────────────────────────────────────────────

  test('main content area has left margin on desktop to avoid sidebar overlap', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= SIDEBAR_BREAKPOINT, 'Desktop-only test');

    const main = page.locator('.main-content');
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    // Main content should start at or after the sidebar
    expect(box!.x).toBeGreaterThanOrEqual(SIDEBAR_WIDTH - 5);
  });

  test('page content has padding and does not touch the viewport edge', async ({ page }) => {
    const content = page.locator('.page-content');
    await expect(content).toBeVisible();
    const box = await content.boundingBox();
    expect(box).not.toBeNull();
    // Should have some left inset
    expect(box!.x).toBeGreaterThan(0);
  });

  test('no horizontal scroll on the layout page', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });

  // ── Navigation links work ─────────────────────────────────────────────

  test('clicking Dashboard nav item navigates to /', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    await page.locator('.sidebar .nav-item', { hasText: 'Dashboard' }).first().click();
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('clicking Task 2 Essays nav item navigates to /writing/task2', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    await page.locator('.sidebar .nav-item', { hasText: 'Task 2 Essays' }).first().click();
    await expect(page).toHaveURL('/writing/task2', { timeout: 5000 });
  });

  // ── Sidebar logo / brand ──────────────────────────────────────────────

  test('sidebar header shows brand title', async ({ page }) => {
    const vw = page.viewportSize()!.width;

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const title = page.locator('.sidebar-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('IELTS Writing');

    const subtitle = page.locator('.sidebar-subtitle');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('Mastery Platform');
  });
});
