import { expect, test, type Page } from '@playwright/test';

async function openFreshLanding(page: Page) {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Onboarding, built into your product.',
    })
  ).toBeVisible();
}

function guidedTour(page: Page) {
  return page.getByRole('dialog', { name: 'Guided tour' });
}

test.describe('GuideLoop product landing', () => {
  test.beforeEach(async ({ page }) => {
    await openFreshLanding(page);
  });

  test('presents the library and working install links', async ({ page }) => {
    await expect(page.getByText('Open-source React onboarding')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Install GuideLoop' })
    ).toHaveAttribute('href', 'https://www.npmjs.com/package/guideloop');
    await expect(
      page.getByRole('link', { name: 'View on GitHub' })
    ).toHaveAttribute('href', 'https://github.com/oznksc/guideloop');
    await expect(page.getByText('React 16.8+')).toBeVisible();
    await expect(page.getByText('TypeScript', { exact: true })).toBeVisible();
  });

  test('moves from the hero to the embedded live experience', async ({ page }) => {
    await page.getByRole('button', { name: 'See GuideLoop in action' }).click();

    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'See GuideLoop working, right here.',
      })
    ).toBeInViewport();
    await expect(page.locator('#live')).toBeFocused();
  });

  test('skip link moves keyboard focus past navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#content')).toBeFocused();
  });

  test('opens, navigates, and skips the five-step tour', async ({ page }) => {
    const opener = page.getByRole('button', { name: 'Start tour' });
    await opener.click();
    const tour = guidedTour(page);
    const nextButton = tour.getByRole('button', { name: 'Next' });

    await expect(tour).toBeVisible();
    await expect(tour.getByText('Step 1 of 5')).toBeVisible();
    await expect(nextButton).toBeFocused();
    await nextButton.click();
    await expect(tour.getByText('Step 2 of 5')).toBeVisible();
    await tour.getByRole('button', { name: 'Previous' }).click();
    await expect(tour.getByText('Step 1 of 5')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(tour.getByText('Step 2 of 5')).toBeVisible();

    await page.getByRole('button', { name: 'View timeline' }).focus();
    await page.keyboard.press('Tab');
    await expect(tour.getByRole('button', { name: 'Previous' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(tour).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(page.getByText('1 of 5 steps completed')).toBeVisible();
  });

  test('finishes the tour and persists checklist progress', async ({ page }) => {
    await page.getByRole('button', { name: 'Start tour' }).click();
    const tour = guidedTour(page);

    for (let step = 1; step < 5; step += 1) {
      await expect(tour.getByText(`Step ${step} of 5`)).toBeVisible();
      await page.keyboard.press('ArrowRight');
    }

    await expect(tour.getByText('Step 5 of 5')).toBeVisible();
    await tour.getByRole('button', { name: 'Finish' }).click();
    await expect(tour).toBeHidden();
    await expect(page.getByText('2 of 5 steps completed')).toBeVisible();

    await page.reload();
    await expect(page.getByText('2 of 5 steps completed')).toBeVisible();
    await expect(
      page
        .getByRole('region', {
          name: 'GuideLoop demo getting started checklist',
        })
        .getByRole('button', { name: /Tour the launch board/ })
    ).toHaveAttribute('data-state', 'success');
  });
});
