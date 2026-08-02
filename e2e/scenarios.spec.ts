import { expect, test, type Page } from '@playwright/test';

async function openLanding(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test.describe('Landing layout & stack carousel', () => {
  test.beforeEach(async ({ page }) => {
    await openLanding(page);
  });

  test('shows three stack code samples in getting started', async ({ page }) => {
    const section = page.locator('#quickstart');
    await expect(section.getByRole('heading', { level: 2 })).toContainText(
      /every stack|three ways|quick start|Same tour/i
    );

    await expect(section.getByLabel('React example', { exact: true })).toBeVisible();
    await expect(section.getByLabel('Vue example', { exact: true })).toBeVisible();
    await expect(section.getByLabel('Svelte example', { exact: true })).toBeVisible();
    await expect(section.getByLabel('Angular example', { exact: true })).toBeVisible();
    await expect(section.getByLabel('Vanilla JS example', { exact: true })).toBeVisible();
    await expect(
      section.getByLabel('Web Component example', { exact: true })
    ).toBeVisible();
  });

  test('stack carousel scrolls on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const carousel = page.locator('.stack-carousel');
    await expect(carousel).toBeVisible();

    const next = page.getByRole('button', { name: 'Next stack card' });
    // Nav buttons only appear under 960px
    await expect(next).toBeVisible();

    const before = await carousel.evaluate((el) => el.scrollLeft);
    await next.click();
    await expect
      .poll(async () => carousel.evaluate((el) => el.scrollLeft), {
        timeout: 3000,
      })
      .toBeGreaterThan(before);
  });

  test('keeps the landing within narrow mobile viewports', async ({ page }) => {
    for (const width of [320, 375, 414, 768]) {
      await page.setViewportSize({ width, height: 844 });
      // wait a tick for layout reflow
      await page.waitForTimeout(50);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(
        dimensions.clientWidth + 2
      );
    }
  });
});
