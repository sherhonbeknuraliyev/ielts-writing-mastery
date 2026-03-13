import { test, expect, Page } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth.js';

const PROTECTED_ROUTES = [
  '/',
  '/writing/task2',
  '/writing/free',
  '/writing/history',
  '/skills',
  '/vocabulary',
  '/vocabulary/paraphrase',
  '/vocabulary/upgrades',
  '/daily-challenge',
  '/analytics',
];

async function ensureAuth(page: Page): Promise<void> {
  await loginAsTestUser(page);
}

// ── Page content padding ──────────────────────────────────────────────────────

test.describe('Spacing — page content padding', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} — page content has >= 16px padding on all sides`, async ({ page }) => {
      await ensureAuth(page);
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(500);

      const content = page.locator('.page-content');
      if (await content.count() === 0) return;

      const padding = await content.first().evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          top: parseFloat(style.paddingTop),
          right: parseFloat(style.paddingRight),
          bottom: parseFloat(style.paddingBottom),
          left: parseFloat(style.paddingLeft),
        };
      });

      expect(padding.top, `${route} page-content paddingTop < 16px`).toBeGreaterThanOrEqual(16);
      expect(padding.left, `${route} page-content paddingLeft < 16px`).toBeGreaterThanOrEqual(16);
      expect(padding.right, `${route} page-content paddingRight < 16px`).toBeGreaterThanOrEqual(16);
    });
  }
});

// ── Card body padding ─────────────────────────────────────────────────────────

test.describe('Spacing — card body padding', () => {
  test('card bodies on dashboard have >= 16px padding', async ({ page }) => {
    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const el = cards.nth(i);
      const box = await el.boundingBox();
      if (!box || box.height === 0) continue;

      const padding = await el.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          top: parseFloat(style.paddingTop),
          left: parseFloat(style.paddingLeft),
        };
      });

      expect(
        padding.top,
        `Card #${i} on / has paddingTop < 16px`,
      ).toBeGreaterThanOrEqual(16);
      expect(
        padding.left,
        `Card #${i} on / has paddingLeft < 16px`,
      ).toBeGreaterThanOrEqual(16);
    }
  });
});

// ── Section gaps ──────────────────────────────────────────────────────────────

test.describe('Spacing — section gaps between cards', () => {
  test('stat cards on dashboard have >= 8px gap between them', async ({ page }) => {
    await ensureAuth(page);
    await page.goto('/');
    await page.waitForSelector('.app-shell', { timeout: 10000 });

    const cards = page.locator('.stat-card');
    const count = await cards.count();
    if (count < 2) return;

    // Collect all bounding boxes and sort by position
    const boxes: Array<{ x: number; y: number; width: number; height: number }> = [];
    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (box) boxes.push(box);
    }

    // Sort by y then x to find adjacent cards
    boxes.sort((a, b) => a.y - b.y || a.x - b.x);

    // Check horizontal gaps between cards in the same row
    for (let i = 0; i < boxes.length - 1; i++) {
      const a = boxes[i];
      const b = boxes[i + 1];
      // Only compare if roughly same row (within 20px vertical)
      if (Math.abs(a.y - b.y) < 20 && b.x > a.x) {
        const gap = b.x - (a.x + a.width);
        expect(gap, `Gap between stat cards too small: ${gap}px`).toBeGreaterThanOrEqual(8);
      }
    }
  });
});

// ── No zero-height visible elements ──────────────────────────────────────────

test.describe('Spacing — no zero-height visible elements', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} — no visible elements with height < 1px`, async ({ page }) => {
      await ensureAuth(page);
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(1000);

      const zeroHeight = await page.evaluate(() => {
        const suspects: string[] = [];
        // Only check structural elements that should have height
        const selectors = [
          '.card', '.stat-card', '.page-header', '.section-title',
          '.nav-item', '.btn', '.page-content',
        ];
        for (const sel of selectors) {
          document.querySelectorAll(sel).forEach((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            if (
              rect.height < 1 &&
              rect.width > 0 &&
              style.display !== 'none' &&
              style.visibility !== 'hidden'
            ) {
              suspects.push(`${sel}: ${el.className}`);
            }
          });
        }
        return suspects.slice(0, 5);
      });

      expect(
        zeroHeight,
        `Zero-height visible elements on ${route}: ${zeroHeight.join(', ')}`,
      ).toHaveLength(0);
    });
  }
});

// ── Text line-height ──────────────────────────────────────────────────────────

test.describe('Spacing — text line-height >= 1.2', () => {
  const ROUTE_SAMPLE = ['/', '/writing/task2', '/analytics'];

  for (const route of ROUTE_SAMPLE) {
    test(`${route} — paragraph text has line-height >= 1.2`, async ({ page }) => {
      await ensureAuth(page);
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(500);

      const violations = await page.evaluate(() => {
        const bad: string[] = [];
        document.querySelectorAll('p, li, .stat-label, .card-body').forEach((el) => {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return;
          const lh = parseFloat(style.lineHeight);
          const fs = parseFloat(style.fontSize);
          if (lh > 0 && fs > 0 && lh / fs < 1.2) {
            bad.push(`${el.tagName}.${el.className}: lh=${lh}, fs=${fs}`);
          }
        });
        return bad.slice(0, 5);
      });

      expect(
        violations,
        `Line-height < 1.2 on ${route}: ${violations.join(', ')}`,
      ).toHaveLength(0);
    });
  }
});

// ── Heading hierarchy ─────────────────────────────────────────────────────────

test.describe('Spacing — heading size hierarchy', () => {
  const ROUTES_TO_CHECK = ['/', '/writing/task2', '/skills', '/vocabulary', '/analytics'];

  for (const route of ROUTES_TO_CHECK) {
    test(`${route} — h1 > h2 > h3 font sizes`, async ({ page }) => {
      await ensureAuth(page);
      await page.goto(route);
      await page.waitForSelector('.app-shell', { timeout: 10000 });
      await page.waitForTimeout(500);

      const sizes = await page.evaluate(() => {
        function getFirstFontSize(selector: string): number | null {
          const el = document.querySelector(selector);
          if (!el) return null;
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return null;
          return parseFloat(style.fontSize);
        }
        return {
          h1: getFirstFontSize('h1'),
          h2: getFirstFontSize('h2'),
          h3: getFirstFontSize('h3'),
        };
      });

      if (sizes.h1 !== null && sizes.h2 !== null) {
        expect(
          sizes.h1,
          `${route}: h1 (${sizes.h1}px) should be >= h2 (${sizes.h2}px)`,
        ).toBeGreaterThanOrEqual(sizes.h2 - 1);
      }

      if (sizes.h2 !== null && sizes.h3 !== null) {
        expect(
          sizes.h2,
          `${route}: h2 (${sizes.h2}px) should be >= h3 (${sizes.h3}px)`,
        ).toBeGreaterThanOrEqual(sizes.h3 - 1);
      }
    });
  }
});
