import { test, expect, Page } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { MIN_TOUCH_TARGET, MIN_FONT_SIZE } from './helpers/viewport.js';

// Helper: set auth in localStorage without reloading the page
async function ensureAuth(page: Page): Promise<void> {
  await loginAsTestUser(page);
}

// Helper: check that no element extends beyond the right edge of the viewport
async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const vw = page.viewportSize()!.width;
  expect(scrollWidth, `Horizontal overflow on ${page.url()}`).toBeLessThanOrEqual(vw + 1);
}

// Helper: get bounding boxes of all interactive elements and check touch targets
async function assertInteractiveTouchTargets(page: Page): Promise<void> {
  const interactives = page.locator('button:visible, a:visible, input:visible, select:visible');
  const count = await interactives.count();

  for (let i = 0; i < count; i++) {
    const el = interactives.nth(i);
    const box = await el.boundingBox();
    if (!box || box.width === 0 || box.height === 0) continue;

    // Skip icon-only elements that use CSS padding tricks and are reliably small decoratives
    const role = await el.getAttribute('role');
    const ariaHidden = await el.getAttribute('aria-hidden');
    if (ariaHidden === 'true') continue;

    // Enforce minimum touch target
    const tag = await el.evaluate((node) => node.tagName.toLowerCase());
    if (tag === 'button' || tag === 'a') {
      expect(
        box.height,
        `Touch target too small on ${page.url()} — element "${await el.textContent()?.then(t => t?.trim().slice(0, 30))}"`
      ).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  }
}

// Helper: check that no element extends beyond the right edge of the viewport
async function assertNoElementsOverflowRight(page: Page): Promise<void> {
  const vw = page.viewportSize()!.width;
  const overflowing = await page.evaluate((viewportWidth) => {
    const overflowers: string[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > viewportWidth + 5 && rect.width > 0 && rect.height > 0) {
        const tag = el.tagName.toLowerCase();
        const cls = el.className ? `.${String(el.className).replace(/\s+/g, '.')}` : '';
        overflowers.push(`${tag}${cls} right=${Math.round(rect.right)}`);
      }
    });
    return overflowers.slice(0, 5); // return first 5 violators
  }, vw);

  expect(
    overflowing,
    `Elements overflow viewport on ${page.url()}: ${overflowing.join(', ')}`
  ).toHaveLength(0);
}

// Helper: check all visible text has sufficient font size
async function assertMinimumFontSizes(page: Page): Promise<void> {
  const smallText = await page.evaluate((minSize) => {
    const violations: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent?.trim() ?? '';
      if (text.length === 0) continue;
      const el = node.parentElement;
      if (!el) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
      const fontSize = parseFloat(style.fontSize);
      if (fontSize < minSize) {
        violations.push(`"${text.slice(0, 20)}" — ${fontSize}px (${el.className})`);
      }
    }
    return violations.slice(0, 5);
  }, MIN_FONT_SIZE);

  expect(
    smallText,
    `Text below ${MIN_FONT_SIZE}px on ${page.url()}: ${smallText.join('; ')}`
  ).toHaveLength(0);
}

// All protected routes to test
const PROTECTED_ROUTES = [
  '/',
  '/writing/task2',
  '/writing/task1',
  '/writing/free',
  '/writing/history',
  '/skills',
  '/vocabulary',
  '/vocabulary/paraphrase',
  '/vocabulary/upgrades',
  '/daily-challenge',
  '/analytics',
];

// ── Per-route responsive checks ───────────────────────────────────────────────

test.describe('Responsive layout — no horizontal overflow', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} — no horizontal scroll`, async ({ page }) => {
      await ensureAuth(page);
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1000); // allow async state to settle
      await assertNoHorizontalOverflow(page);
    });
  }
});

test.describe('Responsive layout — no elements overflow viewport', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} — no elements extend beyond viewport`, async ({ page }) => {
      await ensureAuth(page);
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1500);
      await assertNoElementsOverflowRight(page);
    });
  }
});

test.describe('Responsive layout — minimum font sizes', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} — all text >= ${MIN_FONT_SIZE}px`, async ({ page }) => {
      await ensureAuth(page);
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1500);
      await assertMinimumFontSizes(page);
    });
  }
});

test.describe('Responsive layout — interactive touch targets', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} — buttons and links >= ${MIN_TOUCH_TARGET}px`, async ({ page }) => {
      await ensureAuth(page);
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1500);
      await assertInteractiveTouchTargets(page);
    });
  }
});

// ── Login page checks ─────────────────────────────────────────────────────────

test.describe('Login page responsive checks', () => {
  test('no horizontal overflow on login page', async ({ page }) => {
    await page.goto('/login');
    await assertNoHorizontalOverflow(page);
  });

  test('no elements overflow viewport on login page', async ({ page }) => {
    await page.goto('/login');
    await assertNoElementsOverflowRight(page);
  });

  test('all text on login page is >= 12px', async ({ page }) => {
    await page.goto('/login');
    await assertMinimumFontSizes(page);
  });
});

// ── Sidebar-specific responsive behavior ─────────────────────────────────────

test.describe('Sidebar responsive behavior', () => {
  test('sidebar does not overlay main content on desktop', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= 768, 'Desktop-only test');

    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell');

    const sidebar = page.locator('.sidebar');
    const main = page.locator('.main-content');
    const sidebarBox = await sidebar.boundingBox();
    const mainBox = await main.boundingBox();

    if (!sidebarBox || !mainBox) return;

    // Main content should start at or after sidebar ends
    expect(mainBox.x).toBeGreaterThanOrEqual(sidebarBox.x + sidebarBox.width - 2);
  });

  test('main content takes full width when sidebar is hidden on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > 768, 'Mobile-only test');

    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell');

    const main = page.locator('.main-content');
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    // Main content should start near the left edge on mobile
    expect(box!.x).toBeLessThan(10);
    // Main content should be close to full viewport width
    expect(box!.width).toBeGreaterThan(vw * 0.9);
  });

  test('page-content max-width is respected and content is centered', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw <= 768, 'Desktop-only test — sidebar offset affects centering');

    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell');

    const pageContent = page.locator('.page-content');
    const box = await pageContent.boundingBox();
    expect(box).not.toBeNull();
    // Content width should not exceed 900px (--content-max-width)
    expect(box!.width).toBeLessThanOrEqual(910);
  });

  test('sidebar z-index is above main content when open on mobile', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > 768, 'Mobile-only test');

    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell');

    await page.locator('.mobile-menu-btn').click();

    const sidebar = page.locator('.sidebar');
    const zIndex = await sidebar.evaluate(
      (el) => parseInt(getComputedStyle(el).zIndex, 10),
    );
    expect(zIndex).toBeGreaterThanOrEqual(40);
  });
});

// ── Writing page responsive layout ───────────────────────────────────────────

test.describe('Writing page responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.writing-page', { timeout: 10000 });
  });

  test('writing body stacks vertically on small screens', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > 768, 'Mobile-only test');

    const writingMain = page.locator('.writing-body-main');
    const guide = page.locator('.writing-guide');

    const mainBox = await writingMain.boundingBox();
    const guideBox = await guide.boundingBox();

    if (!mainBox || !guideBox) return;

    // On mobile, guide should appear below the main textarea area
    // (within reasonable tolerance — it might be hidden)
    if (guideBox.height > 0) {
      expect(guideBox.y).toBeGreaterThanOrEqual(mainBox.y + mainBox.height - 10);
    }
  });

  test('textarea is full content area width', async ({ page }) => {
    const textarea = page.locator('.writing-textarea');
    const parent = page.locator('.writing-body-main');

    const textareaBox = await textarea.boundingBox();
    const parentBox = await parent.boundingBox();

    if (!textareaBox || !parentBox) return;
    // Textarea width should match parent (within 2px for borders)
    expect(textareaBox.width).toBeGreaterThanOrEqual(parentBox.width - 10);
  });

  test('writing toolbar does not overflow on small screens', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const vw = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(vw + 1);
  });
});
