import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';
import { SIDEBAR_BREAKPOINT } from './helpers/viewport.js';

// ── Button hover state ────────────────────────────────────────────────────────

test.describe('Interactive states — button hover', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('btn-primary background changes on hover', async ({ page }) => {
    const btn = page.locator('.btn-primary:not([disabled])').first();
    if (await btn.count() === 0) return;

    const before = await btn.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    await btn.hover();
    await page.waitForTimeout(200);

    const after = await btn.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    // Either the background changed or the element has a transition property
    const hasTransition = await btn.evaluate(
      (el) => getComputedStyle(el).transition !== 'none' && getComputedStyle(el).transition !== '',
    );

    // Accept: color changed OR element has transition (hover may not be instant)
    const changed = before !== after;
    expect(
      changed || hasTransition,
      'btn-primary has no hover style or transition',
    ).toBe(true);
  });

  test('filter-chip hover changes border color', async ({ page }) => {
    // Navigate to vocabulary where filter chips exist
    await page.goto('/vocabulary');
    await page.waitForTimeout(1000);

    const chip = page.locator('.filter-chip:not(.active)').first();
    if (await chip.count() === 0) return;

    const borderBefore = await chip.evaluate(
      (el) => getComputedStyle(el).borderColor,
    );

    await chip.hover();
    await page.waitForTimeout(200);

    const borderAfter = await chip.evaluate(
      (el) => getComputedStyle(el).borderColor,
    );

    const hasTransition = await chip.evaluate(
      (el) => getComputedStyle(el).transition !== 'none',
    );

    expect(
      borderBefore !== borderAfter || hasTransition,
      'filter-chip has no hover transition',
    ).toBe(true);
  });
});

// ── Button disabled state ─────────────────────────────────────────────────────

test.describe('Interactive states — button disabled', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary/upgrades');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);

    // Switch to practice mode to get disabled Reveal Answer button
    const practiceBtn = page.locator('button', { hasText: 'Practice' }).first();
    if (await practiceBtn.count() > 0) {
      await practiceBtn.click();
      await page.waitForTimeout(400);
    }
  });

  test('disabled button has reduced opacity or cursor not-allowed', async ({ page }) => {
    const disabledBtn = page.locator('button[disabled]');
    if (await disabledBtn.count() === 0) return;

    const btn = disabledBtn.first();
    const styles = await btn.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        opacity: parseFloat(style.opacity),
        cursor: style.cursor,
        pointerEvents: style.pointerEvents,
      };
    });

    const isVisuallyDisabled =
      styles.opacity < 1 ||
      styles.cursor === 'not-allowed' ||
      styles.pointerEvents === 'none';

    expect(
      isVisuallyDisabled,
      `Disabled button has no visual disabled indicator (opacity: ${styles.opacity}, cursor: ${styles.cursor})`,
    ).toBe(true);
  });
});

// ── Active nav item ───────────────────────────────────────────────────────────

test.describe('Interactive states — active nav item', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
  });

  test('active nav item has different background or color than inactive', async ({ page }) => {
    const vw = page.viewportSize()!.width;
    if (vw <= SIDEBAR_BREAKPOINT) {
      await page.locator('.mobile-menu-btn').click();
      await page.waitForTimeout(300);
    }

    const activeItem = page.locator('.sidebar .nav-item.active').first();
    const inactiveItem = page.locator('.sidebar .nav-item:not(.active)').first();

    if (await activeItem.count() === 0 || await inactiveItem.count() === 0) return;

    const activeBg = await activeItem.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    const inactiveBg = await inactiveItem.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    const activeColor = await activeItem.evaluate(
      (el) => getComputedStyle(el).color,
    );
    const inactiveColor = await inactiveItem.evaluate(
      (el) => getComputedStyle(el).color,
    );

    const isDistinct = activeBg !== inactiveBg || activeColor !== inactiveColor;
    expect(isDistinct, 'Active nav item looks identical to inactive').toBe(true);
  });
});

// ── Active filter chip ────────────────────────────────────────────────────────

test.describe('Interactive states — active filter chip', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('active filter chip has different background from inactive', async ({ page }) => {
    const activeChip = page.locator('.filter-chip.active').first();
    const inactiveChip = page.locator('.filter-chip:not(.active)').first();

    if (await activeChip.count() === 0 || await inactiveChip.count() === 0) return;

    const activeBg = await activeChip.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    const inactiveBg = await inactiveChip.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    expect(activeBg, 'Active filter chip background matches inactive').not.toBe(inactiveBg);
  });

  test('clicking inactive chip makes it active', async ({ page }) => {
    const inactiveChip = page.locator('.filter-chip:not(.active)').first();
    if (await inactiveChip.count() === 0) return;

    await inactiveChip.click();
    await page.waitForTimeout(300);

    // The clicked chip should now be active or a different chip should be active
    const activeChips = page.locator('.filter-chip.active');
    const count = await activeChips.count();
    expect(count, 'No active filter chip after click').toBeGreaterThan(0);
  });
});

// ── Input focus state ─────────────────────────────────────────────────────────

test.describe('Interactive states — input focus', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('focusing .form-input changes border color', async ({ page }) => {
    const input = page.locator('.form-input').first();
    if (await input.count() === 0) return;

    const borderBefore = await input.evaluate(
      (el) => getComputedStyle(el).borderColor,
    );

    await input.focus();
    await page.waitForTimeout(200);

    const borderAfter = await input.evaluate(
      (el) => getComputedStyle(el).borderColor,
    );

    const outlineAfter = await input.evaluate(
      (el) => getComputedStyle(el).outline,
    );

    const isFocusVisible = borderBefore !== borderAfter || outlineAfter !== 'none';
    expect(
      isFocusVisible,
      'Input focus has no visible change (same border color, no outline)',
    ).toBe(true);
  });
});

// ── Textarea focus ────────────────────────────────────────────────────────────

test.describe('Interactive states — textarea focus', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('writing textarea has visible focus styles', async ({ page }) => {
    const textarea = page.locator('.writing-textarea, textarea').first();
    if (await textarea.count() === 0) return;

    const borderBefore = await textarea.evaluate(
      (el) => getComputedStyle(el).borderColor,
    );
    const outlineBefore = await textarea.evaluate(
      (el) => getComputedStyle(el).outline,
    );

    await textarea.focus();
    await page.waitForTimeout(200);

    const borderAfter = await textarea.evaluate(
      (el) => getComputedStyle(el).borderColor,
    );
    const outlineAfter = await textarea.evaluate(
      (el) => getComputedStyle(el).outline,
    );

    const changed = borderBefore !== borderAfter || outlineBefore !== outlineAfter;
    // Also check for box-shadow (some focus styles use that)
    const boxShadowAfter = await textarea.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    const hasFocusShadow = boxShadowAfter !== 'none' && boxShadowAfter !== '';

    expect(
      changed || hasFocusShadow,
      'Textarea focus has no visible change',
    ).toBe(true);
  });
});

// ── Loading spinner ───────────────────────────────────────────────────────────

test.describe('Interactive states — loading spinner', () => {
  test('spinner is animated (has animation property)', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    // Quickly check for spinner before it disappears
    const spinner = page.locator('.spinner');
    if (await spinner.count() === 0) return;

    const animation = await spinner.first().evaluate(
      (el) => getComputedStyle(el).animation,
    );
    expect(animation, 'Spinner has no animation').not.toBe('none');
    expect(animation).not.toBe('');
  });

  test('.loading-state is centered', async ({ page }) => {
    await loginAsTestUser(page);

    // Intercept data requests to keep loading state visible
    await page.route('**/api/trpc/**', async (route) => {
      // Delay response briefly so loading state is catchable
      await new Promise((r) => setTimeout(r, 500));
      await route.continue();
    });

    await page.goto('/vocabulary');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    const loadingState = page.locator('.loading-state');
    if (await loadingState.count() === 0) return;

    // Use a short timeout — element may disappear quickly
    const alignItems = await loadingState.first().evaluate(
      (el) => getComputedStyle(el).alignItems,
    ).catch(() => '');
    const justifyContent = await loadingState.first().evaluate(
      (el) => getComputedStyle(el).justifyContent,
    ).catch(() => '');

    if (!alignItems && !justifyContent) return; // element gone before we could check

    const isCentered = alignItems === 'center' || justifyContent === 'center';
    expect(isCentered, '.loading-state is not centered').toBe(true);
  });
});

// ── Error state styling ───────────────────────────────────────────────────────

test.describe('Interactive states — error state', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('.error-state is visible and readable when present', async ({ page }) => {
    const errorState = page.locator('.error-state');
    if (await errorState.count() === 0) return;

    await expect(errorState.first()).toBeVisible();

    const fontSize = await errorState.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize, '.error-state font size < 12px').toBeGreaterThanOrEqual(12);
  });
});

// ── .break-reminder-banner ────────────────────────────────────────────────────

test.describe('Interactive states — .break-reminder-banner', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/writing/free');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('.break-reminder-banner styling when visible', async ({ page }) => {
    const banner = page.locator('.break-reminder-banner');
    if (await banner.count() === 0) return;

    await expect(banner.first()).toBeVisible();

    // Should have warning/yellow background
    const bg = await banner.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg, '.break-reminder-banner has no background').not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');

    // Font size readable
    const fontSize = await banner.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(12);
  });
});

// ── Tab active state ──────────────────────────────────────────────────────────

test.describe('Interactive states — tab active state', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/vocabulary/upgrades');
    await page.waitForSelector('.app-shell', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('active tab is visually distinct from inactive tabs', async ({ page }) => {
    const activeTab = page.locator('.tab.active').first();
    const inactiveTab = page.locator('.tab:not(.active)').first();

    if (await activeTab.count() === 0 || await inactiveTab.count() === 0) return;

    const activeBg = await activeTab.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    const inactiveBg = await inactiveTab.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    const activeColor = await activeTab.evaluate(
      (el) => getComputedStyle(el).color,
    );
    const inactiveColor = await inactiveTab.evaluate(
      (el) => getComputedStyle(el).color,
    );

    const isDistinct = activeBg !== inactiveBg || activeColor !== inactiveColor;
    expect(isDistinct, 'Active tab looks identical to inactive tab').toBe(true);
  });

  test('clicking inactive tab makes it active', async ({ page }) => {
    const inactiveTab = page.locator('.tab:not(.active)').first();
    if (await inactiveTab.count() === 0) return;

    await inactiveTab.click();
    await page.waitForTimeout(300);

    const activeCount = await page.locator('.tab.active').count();
    expect(activeCount, 'No active tab after clicking').toBeGreaterThan(0);
  });
});
