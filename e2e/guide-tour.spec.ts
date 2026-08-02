import { expect, test, type Page } from '@playwright/test';

async function openLanding(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test.describe('GuideLoop product landing', () => {
  test.beforeEach(async ({ page }) => {
    await openLanding(page);
  });

  test('presents hero, stack samples, and GitHub link', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Onboarding for any stack|Product Tours/i
    );

    // npm badges above code cards in getting started
    await expect(
      page.locator('#quickstart').getByRole('link', { name: /@guideloop\/react/i })
    ).toBeVisible();
    await expect(
      page.locator('#quickstart').getByRole('link', { name: /@guideloop\/vanilla/i }).first()
    ).toBeVisible();

    await expect(page.getByRole('link', { name: 'GitHub' }).first()).toHaveAttribute(
      'href',
      'https://github.com/oznksc/guideloop'
    );

    await expect(page.getByText('App.tsx').first()).toBeVisible();
    await expect(page.getByText('tour.js').first()).toBeVisible();
    await expect(page.getByText('index.html').first()).toBeVisible();
  });

  test('hero install copy control is interactive', async ({ page }) => {
    const copyBtn = page.getByRole('button', {
      name: /Copy (React|Svelte) install command/,
    });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(copyBtn).toBeEnabled();
  });

  test('theme menu switches page theme attribute', async ({ page }) => {
    await page.locator('.theme-dropdown-trigger').click();
    await page.getByRole('option', { name: /Terminal CLI/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'terminal');
  });
});
