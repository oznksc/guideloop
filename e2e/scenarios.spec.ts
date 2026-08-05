import { expect, test, type Page } from '@playwright/test';

async function openLanding(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test.describe('Landing layout & stack explorer', () => {
  test.beforeEach(async ({ page }) => {
    await openLanding(page);
  });

  test('shows stack tabs and selected example in getting started', async ({
    page,
  }) => {
    const section = page.locator('#quickstart');
    await expect(section.getByRole('heading', { level: 2 })).toContainText(
      /every stack|Same tour/i
    );

    const tablist = section.getByRole('tablist', { name: 'Framework stacks' });
    await expect(tablist).toBeVisible();

    for (const name of [
      'React',
      'Vue',
      'Svelte',
      'Angular',
      'Vanilla',
      'Web Component',
    ]) {
      await expect(
        tablist.getByRole('tab', { name: new RegExp(name, 'i') })
      ).toBeVisible();
    }

    // Default selection is React
    await expect(section.getByRole('tab', { name: /React/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(
      section.getByLabel('React example', { exact: true })
    ).toBeVisible();
  });

  test('stack tabs switch the detail panel and code sample', async ({
    page,
  }) => {
    const section = page.locator('#quickstart');
    await section.getByRole('tab', { name: /Vue/i }).click();

    await expect(section.getByRole('tab', { name: /Vue/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(section.getByRole('heading', { level: 3 })).toHaveText('Vue');
    await expect(
      section.getByLabel('Vue example', { exact: true })
    ).toBeVisible();
    await expect(section.locator('.stack-panel-install code')).toContainText(
      '@guideloop/vue'
    );
  });

  test('keeps the landing within narrow mobile viewports', async ({ page }) => {
    for (const width of [320, 375, 414, 768]) {
      await page.setViewportSize({ width, height: 844 });
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
