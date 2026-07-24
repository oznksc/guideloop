import { expect, test, type Page } from '@playwright/test';

async function openFreshLanding(page: Page) {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(
    page.getByRole('heading', {
      level: 1,
    })
  ).toBeVisible();
}

function guidedTour(page: Page) {
  return page.getByRole('dialog', { name: 'Guided tour' });
}

test.describe('GuideLoop product landing & spotlight tests', () => {
  test.beforeEach(async ({ page }) => {
    await openFreshLanding(page);
  });

  test('presents library hero and working github repository link', async ({ page }) => {
    await expect(page.getByText('React Step Spotlight')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Star on GitHub' })
    ).toHaveAttribute('href', 'https://github.com/oznksc/guideloop');
  });

  test('opens, navigates, and tests single element spotlight triggers', async ({ page }) => {
    const opener = page.getByRole('button', { name: 'Run Tour Sandbox [T]' }).first();
    await opener.click();
    const tour = guidedTour(page);
    const nextButton = tour.getByRole('button', { name: 'Next' });

    await expect(tour).toBeVisible();
    await expect(tour.getByText('Step 1 of 5')).toBeVisible();
    await expect(nextButton).toBeFocused();

    // Verify Step 1 spotlights #test-search
    await expect(page.locator('#test-search')).toBeVisible();

    await nextButton.click();
    await expect(tour.getByText('Step 2 of 5')).toBeVisible();

    // Verify Step 2 spotlights #test-filter-tabs
    await expect(page.locator('#test-filter-tabs')).toBeVisible();

    await tour.getByRole('button', { name: 'Previous' }).click();
    await expect(tour.getByText('Step 1 of 5')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(tour).toBeHidden();
  });

  test('finishes the 5-step tour and updates checklist state', async ({ page }) => {
    await page.getByRole('button', { name: 'Run Tour Sandbox [T]' }).first().click();
    const tour = guidedTour(page);

    for (let step = 1; step < 5; step += 1) {
      await expect(tour.getByText(`Step ${step} of 5`)).toBeVisible();
      await page.keyboard.press('ArrowRight');
    }

    await expect(tour.getByText('Step 5 of 5')).toBeVisible();
    const finishBtn = tour.getByRole('button', { name: 'Finish' });
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();
    await expect(tour).toBeHidden();
  });

  test('triggers individual target spotlights from quick trigger pills', async ({ page }) => {
    await page.getByRole('button', { name: 'Target Search' }).click();
    const tour = guidedTour(page);
    await expect(tour).toBeVisible();
    await expect(tour.getByText('Step 1 of 5')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Target Bell' }).click();
    await expect(tour).toBeVisible();
    await expect(tour.getByText('Step 4 of 5')).toBeVisible();
    await page.keyboard.press('Escape');
  });
});
