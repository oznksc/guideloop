import { test, expect } from '@playwright/test';

test.describe('GuideLoop Basic Tour', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display the dashboard page', async ({ page }) => {
    await expect(page.locator('#help-button')).toBeVisible();
    await expect(page.locator('#search-bar')).toBeVisible();
  });

  test('should start tour when Walkthrough button is clicked', async ({ page }) => {
    await page.locator('#help-button').click();
    await expect(page.locator('.guideloop-container')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toHaveAttribute('aria-label', 'Guided tour');
  });

  test('should show first step content', async ({ page }) => {
    await page.locator('#help-button').click();
    await expect(page.locator('[role="tooltip"]')).toBeVisible();
  });

  test('should show step counter', async ({ page }) => {
    await page.locator('#help-button').click();
    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test('should navigate to next step', async ({ page }) => {
    await page.locator('#help-button').click();
    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.getByText(/Step 2 of/)).toBeVisible();
  });

  test('should navigate back with Previous button', async ({ page }) => {
    await page.locator('#help-button').click();
    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.getByText(/Step 2 of/)).toBeVisible();

    await page.getByRole('button', { name: 'Geri' }).click();
    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });

  test('should close tour when Skip is clicked', async ({ page }) => {
    await page.locator('#help-button').click();
    await page.getByRole('button', { name: 'Atla' }).click();
    await expect(page.locator('.guideloop-container')).not.toBeVisible();
  });

  test('should close tour on Escape key', async ({ page }) => {
    await page.locator('#help-button').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.guideloop-container')).not.toBeVisible();
  });

  test('should navigate with ArrowRight key', async ({ page }) => {
    await page.locator('#help-button').click();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText(/Step 2 of/)).toBeVisible();
  });

  test('should complete full basic tour', async ({ page }) => {
    await page.locator('#help-button').click();

    const basicTourSteps = 5;
    for (let i = 1; i < basicTourSteps; i++) {
      await expect(page.getByText(new RegExp(`Step ${i} of ${basicTourSteps}`))).toBeVisible();
      await page.getByRole('button', { name: 'İleri' }).click();
    }

    await expect(page.getByText(`Step ${basicTourSteps} of ${basicTourSteps}`)).toBeVisible();
    await page.getByRole('button', { name: 'Bitir' }).click();
    await expect(page.locator('.guideloop-container')).not.toBeVisible();
  });
});

test.describe('GuideLoop Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#help-button').click();
    await page.waitForSelector('[role="tooltip"]');
  });

  test('should navigate forward with ArrowRight', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText(/Step 2 of/)).toBeVisible();
  });

  test('should navigate back with ArrowLeft', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText(/Step 2 of/)).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByText(/Step 1 of/)).toBeVisible();
  });
});

test.describe('GuideLoop Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle settings panel', async ({ page }) => {
    const fabButton = page.locator('button').filter({ hasText: '' }).first();
    await fabButton.click();
  });

  test('should start tour with custom theme', async ({ page }) => {
    await page.locator('#help-button').click();
    await expect(page.locator('.guideloop-container')).toBeVisible();
    await expect(page.locator('[role="tooltip"]')).toBeVisible();
  });
});
