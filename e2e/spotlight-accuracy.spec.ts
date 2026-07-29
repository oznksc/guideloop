import { expect, test, type Page } from '@playwright/test';

async function openFreshLanding(page: Page) {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

function guidedTour(page: Page) {
  return page.getByRole('dialog', { name: 'Guided tour' });
}

/**
 * Get the spotlight ring bounding rect (div or SVG with .guideloop-spotlight).
 */
async function getSpotlightRect(page: Page) {
  const ring = page.locator('.guideloop-spotlight').first();
  await expect(ring).toBeVisible();
  return ring.boundingBox();
}

/**
 * Assert that the spotlight overlay visually covers the given target element.
 */
async function expectSpotlightCoversTarget(page: Page, selector: string) {
  // Wait for smooth scroll and spotlight recalculation
  await page.waitForTimeout(600);

  const targetBox = await page.locator(selector).boundingBox();
  expect(targetBox, `target ${selector} should be visible`).not.toBeNull();

  const spotlightBox = await getSpotlightRect(page);
  expect(spotlightBox, 'spotlight should be visible').not.toBeNull();

  // The spotlight center should be close to the target center (within padding tolerance)
  const targetCenterX = targetBox!.x + targetBox!.width / 2;
  const targetCenterY = targetBox!.y + targetBox!.height / 2;
  const spotlightCenterX = spotlightBox!.x + spotlightBox!.width / 2;
  const spotlightCenterY = spotlightBox!.y + spotlightBox!.height / 2;

  // Allow 80px tolerance for padding, scroll animation, and viewport adjustments
  const tolerance = 80;
  expect(
    Math.abs(targetCenterX - spotlightCenterX),
    `X offset for ${selector}: target=${targetCenterX.toFixed(0)}, spotlight=${spotlightCenterX.toFixed(0)}`,
  ).toBeLessThan(tolerance);
  expect(
    Math.abs(targetCenterY - spotlightCenterY),
    `Y offset for ${selector}: target=${targetCenterY.toFixed(0)}, spotlight=${spotlightCenterY.toFixed(0)}`,
  ).toBeLessThan(tolerance);
}

test.describe('Spotlight target accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await openFreshLanding(page);
    // Scroll the playground section into view first
    await page.locator('#live').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  });

  test('Target Search button spotlights #test-search element', async ({ page }) => {
    await page.locator('#live').getByRole('button', { name: 'Target Search' }).click();
    const tour = guidedTour(page);
    await expect(tour).toBeVisible();
    await expect(tour.getByText('Step 1 of 5')).toBeVisible();
    await expectSpotlightCoversTarget(page, '#test-search');
    await page.keyboard.press('Escape');
  });

  test('Target Filters button spotlights #test-filter-tabs element', async ({ page }) => {
    await page.locator('#live').getByRole('button', { name: 'Target Filters' }).click();
    const tour = guidedTour(page);
    await expect(tour).toBeVisible();
    await expect(tour.getByText('Step 2 of 5')).toBeVisible();
    await expectSpotlightCoversTarget(page, '#test-filter-tabs');
    await page.keyboard.press('Escape');
  });

  test('Target Metrics button spotlights #test-metrics element', async ({ page }) => {
    await page.locator('#live').getByRole('button', { name: 'Target Metrics' }).click();
    const tour = guidedTour(page);
    await expect(tour).toBeVisible();
    await expect(tour.getByText('Step 3 of 5')).toBeVisible();
    await expectSpotlightCoversTarget(page, '#test-metrics');
    await page.keyboard.press('Escape');
  });

  test('Target Bell button spotlights #test-notifications element', async ({ page }) => {
    await page.locator('#live').getByRole('button', { name: 'Target Bell' }).click();
    const tour = guidedTour(page);
    await expect(tour).toBeVisible();
    await expect(tour.getByText('Step 4 of 5')).toBeVisible();
    await expectSpotlightCoversTarget(page, '#test-notifications');
    await page.keyboard.press('Escape');
  });

  test('Target Form button spotlights #test-action-form element', async ({ page }) => {
    await page.locator('#live').getByRole('button', { name: 'Target Form' }).click();
    const tour = guidedTour(page);
    await expect(tour).toBeVisible();
    await expect(tour.getByText('Step 5 of 5')).toBeVisible();
    await expectSpotlightCoversTarget(page, '#test-action-form');
    await page.keyboard.press('Escape');
  });

  test('sequential target triggers each spotlight the correct element', async ({ page }) => {
    // Click Target Bell first
    await page.locator('#live').getByRole('button', { name: 'Target Bell' }).click();
    await expect(guidedTour(page)).toBeVisible();
    await expectSpotlightCoversTarget(page, '#test-notifications');
    await page.keyboard.press('Escape');
    await expect(guidedTour(page)).toBeHidden();

    // Then click Target Search
    await page.locator('#live').getByRole('button', { name: 'Target Search' }).click();
    await expect(guidedTour(page)).toBeVisible();
    await expectSpotlightCoversTarget(page, '#test-search');
    await page.keyboard.press('Escape');
  });
});
