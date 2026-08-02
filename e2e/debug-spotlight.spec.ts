import { expect, test } from '@playwright/test';

test('landing loads with getting-started code samples', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#quickstart')).toBeVisible();
  await expect(page.getByText('import { GuideLoop').first()).toBeVisible();
});
