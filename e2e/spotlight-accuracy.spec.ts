import { expect, test } from '@playwright/test';

/**
 * Ambient hero spotlight is decorative; package unit tests cover geometry.
 * Keep a smoke assertion so the project still contributes to CI.
 */
test.describe('Hero smoke', () => {
  test('hero section and ambient spotlight mount', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.hero-spotlight').first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
