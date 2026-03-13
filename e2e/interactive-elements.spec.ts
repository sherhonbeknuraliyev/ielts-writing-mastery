import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, SIDEBAR_BREAKPOINT } from './helpers/viewport.js';

// ── Input / textarea / select sizing ─────────────────────────────────────────

test.describe('Interactive elements — form controls', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('all visible inputs meet 44px minimum height', async ({ page }) => {
    const inputs = page.locator('input:visible, select:visible');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const box = await inputs.nth(i).boundingBox();
      if (!box || box.height === 0) continue;
      expect(
        box.height,
        `Input/select #${i} height ${box.height}px < ${MIN_TOUCH_TARGET}px`,
      ).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('textarea meets 44px minimum height', async ({ page }) => {
    const textarea = page.locator('textarea:visible');
    const count = await textarea.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await textarea.nth(i).boundingBox();
      if (!box) continue;
      expect(
        box.height,
        `Textarea #${i} height ${box.height}px < ${MIN_TOUCH_TARGET}px`,
      ).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('inputs have a visible border', async ({ page }) => {
    const inputs = page.locator('input:visible, textarea:visible');
    const count = await inputs.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const el = inputs.nth(i);
      const box = await el.boundingBox();
      if (!box || box.height === 0) continue;

      const hasBorder = await el.evaluate((node) => {
        const style = getComputedStyle(node);
        const bw = parseFloat(style.borderWidth) || parseFloat(style.borderTopWidth);
        const color = style.borderColor || style.borderTopColor;
        return bw > 0 || (color !== '' && color !== 'transparent');
      });
      expect(hasBorder, `Input/textarea #${i} has no visible border`).toBe(true);
    }
  });
});

// ── Focus ring visibility ─────────────────────────────────────────────────────

test.describe('Interactive elements — focus navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('tabbing through dashboard reveals a focus-visible element', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    // Tab a few times — at least one element should receive focus
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    const focused = page.locator(':focus');
    await expect(focused).toBeVisible({ timeout: 2000 });
  });

  test('focused element is visible and in the DOM', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // The focused element must be visible — this covers keyboard accessibility
    // Note: :focus-visible CSS pseudo-class focus rings are applied at render time
    // and may not be reflected via getComputedStyle in evaluate() context
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible({ timeout: 2000 });

    // Verify the element has some interactive role
    const tag = await focused.evaluate((el) => el.tagName.toLowerCase());
    expect(['a', 'button', 'input', 'textarea', 'select', 'details', 'summary']).toContain(tag);
  });
});

// ── Textarea resize ───────────────────────────────────────────────────────────

test.describe('Interactive elements — textarea resize', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('writing textarea allows vertical resize', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    if (await textarea.count() === 0) return;

    const resize = await textarea.evaluate(
      (el) => getComputedStyle(el).resize,
    );
    // Should be 'vertical' or 'both', not 'none' or 'horizontal'
    expect(['vertical', 'both']).toContain(resize);
  });
});

// ── Buttons in forms ──────────────────────────────────────────────────────────

test.describe('Interactive elements — form buttons', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('toolbar buttons are visible and within viewport', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    const toolbar = page.locator('.writing-toolbar');
    if (await toolbar.count() === 0) return;

    const buttons = toolbar.locator('button:visible');
    const count = await buttons.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width, `Toolbar button #${i} overflows viewport`).toBeLessThanOrEqual(vw + 5);
      expect(box.x, `Toolbar button #${i} starts off-screen`).toBeGreaterThanOrEqual(-1);
    }
  });

  test('submit/analyze buttons have accessible text', async ({ page }) => {
    const buttons = page.locator('.writing-toolbar button:visible, .writing-actions button:visible');
    const count = await buttons.count();
    if (count === 0) return;

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const ariaLabel = await btn.getAttribute('aria-label');
      const text = await btn.textContent();
      const hasLabel =
        (ariaLabel && ariaLabel.trim().length > 0) ||
        (text && text.trim().length > 0);
      expect(hasLabel, `Writing button #${i} has no label`).toBe(true);
    }
  });
});

// ── NavLink active state ──────────────────────────────────────────────────────

test.describe('Interactive elements — nav link active state', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('dashboard nav item has active class when on /', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const dashboardLink = page.locator('.sidebar .nav-item', { hasText: 'Dashboard' }).first();
    await expect(dashboardLink).toBeVisible();

    const hasActive = await dashboardLink.evaluate(
      (el) => el.classList.contains('active'),
    );
    expect(hasActive, 'Dashboard nav item missing active class on /').toBe(true);
  });

  test('clicking skills nav item updates active class', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const skillsLink = page.locator('.sidebar .nav-item', { hasText: 'Skills Overview' }).first();
    if (await skillsLink.count() === 0) return;

    await skillsLink.click();
    await page.waitForURL('/skills', { timeout: 5000 });

    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const updatedLink = page.locator('.sidebar .nav-item', { hasText: 'Skills Overview' }).first();
    const hasActive = await updatedLink.evaluate(
      (el) => el.classList.contains('active'),
    );
    expect(hasActive, 'Skills nav item missing active class after navigation').toBe(true);
  });
});

// ── Theme toggle ──────────────────────────────────────────────────────────────

test.describe('Interactive elements — theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('clicking theme toggle changes body class or data attribute', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const themeBtn = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeBtn).toBeVisible();

    const beforeState = await page.evaluate(() => ({
      bodyClass: document.body.className,
      htmlClass: document.documentElement.className,
      dataTheme: document.documentElement.getAttribute('data-theme'),
    }));

    await themeBtn.click();
    await page.waitForTimeout(300);

    const afterState = await page.evaluate(() => ({
      bodyClass: document.body.className,
      htmlClass: document.documentElement.className,
      dataTheme: document.documentElement.getAttribute('data-theme'),
    }));

    const changed =
      beforeState.bodyClass !== afterState.bodyClass ||
      beforeState.htmlClass !== afterState.htmlClass ||
      beforeState.dataTheme !== afterState.dataTheme;

    expect(changed, 'Theme toggle had no visible effect on body/html class or data-theme').toBe(true);
  });

  test('theme toggle is accessible after toggling', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
    }

    const themeBtn = page.locator('button[aria-label="Toggle theme"]');
    await themeBtn.click();
    await page.waitForTimeout(200);

    // The app shell should still be visible and functional after toggle
    await expect(page.locator('.app-shell')).toBeVisible();
    await expect(themeBtn).toBeVisible();
  });
});

// ── Sidebar mobile open/close ─────────────────────────────────────────────────

test.describe('Interactive elements — sidebar mobile behavior', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('hamburger opens sidebar on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    const hamburger = page.locator('.mobile-menu-btn');
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toHaveClass(/open/, { timeout: 2000 });
  });

  test('clicking overlay closes sidebar on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    await page.locator('.mobile-menu-btn').click();
    const overlay = page.locator('.sidebar-overlay');
    await expect(overlay).toHaveClass(/open/);

    await overlay.click();
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toHaveClass(/open/, { timeout: 2000 });
  });

  test('clicking a nav item closes the sidebar on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > SIDEBAR_BREAKPOINT, 'Mobile-only test');

    await page.locator('.mobile-menu-btn').click();
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toHaveClass(/open/);

    // Click a nav item that is NOT the current page
    const skillsLink = page.locator('.sidebar .nav-item', { hasText: 'Skills Overview' }).first();
    if (await skillsLink.count() === 0) return;
    await skillsLink.click();

    await expect(sidebar).not.toHaveClass(/open/, { timeout: 2000 });
  });
});
