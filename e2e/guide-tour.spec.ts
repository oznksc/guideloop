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

    // Default stack (React) badge + file name
    await expect(
      page.locator('#quickstart').getByRole('link', { name: /@guideloop\/react/i })
    ).toBeVisible();
    await expect(page.getByText('App.tsx').first()).toBeVisible();

    // Switch to Vanilla and Web Component samples
    await page.getByRole('tab', { name: /Vanilla/i }).click();
    await expect(
      page.locator('#quickstart').getByRole('link', { name: /@guideloop\/vanilla/i })
    ).toBeVisible();
    await expect(page.getByText('tour.js').first()).toBeVisible();

    await page.getByRole('tab', { name: /WC|Web Component/i }).click();
    await expect(page.getByText('index.html').first()).toBeVisible();

    await expect(
      page.getByRole('link', { name: /GitHub/i }).first()
    ).toHaveAttribute('href', 'https://github.com/oznksc/guideloop');
  });

  test('hero install copy control is interactive', async ({ page }) => {
    const copyBtn = page
      .locator('.hero-section')
      .getByRole('button', { name: /Copy .* install command/ });
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
