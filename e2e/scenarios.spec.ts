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

function checklist(page: Page) {
  return page.getByRole('region', {
    name: 'GuideLoop demo getting started checklist',
  });
}

test.describe('Embedded onboarding experience & playground', () => {
  test.beforeEach(async ({ page }) => {
    await openFreshLanding(page);
  });

  test('starts with initial completed onboarding steps', async ({ page }) => {
    const onboarding = checklist(page);
    await expect(onboarding.getByText('1 of 4 steps completed')).toBeVisible();
  });

  test('validates milestone modal task', async ({ page }) => {
    const onboarding = checklist(page);
    await onboarding
      .getByRole('button', { name: /Trigger modal action/ })
      .click();

    const modal = page.getByRole('dialog', { name: 'Create a milestone' });
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Add milestone' }).click();
    await expect(
      modal.getByText('Enter a milestone name to continue.')
    ).toBeVisible();

    await modal
      .getByRole('textbox', { name: 'Milestone name' })
      .fill('Release candidate');
    await modal.getByRole('button', { name: 'Add milestone' }).click();

    await expect(modal).toBeHidden();
  });

  test('completes code review navigation link', async ({ page }) => {
    const onboarding = checklist(page);
    await onboarding
      .getByRole('link', { name: /Review component code/ })
      .click();

    await expect(page).toHaveURL(/#integration$/);
  });

  test('keeps interactive playground controls functional', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Milestone or task name' });
    await input.fill('Release candidate v1.5');
    await page.locator('#test-action-form button[type="submit"]').click({ force: true });
    await expect(page.getByText('Saved')).toBeVisible();
  });

  test('keeps the landing within narrow mobile viewports', async ({ page }) => {
    for (const width of [320, 375, 414, 768]) {
      await page.setViewportSize({ width, height: 844 });
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
    }

    await page.setViewportSize({ width: 320, height: 844 });
    const target = page.locator('#test-search');
    await expect(target).toBeVisible();
    const targetBox = await target.boundingBox();
    expect(targetBox).not.toBeNull();
    expect(targetBox!.width).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Run Tour Sandbox [T]' }).first().click();
    await expect(page.getByRole('dialog', { name: 'Guided tour' })).toBeVisible();
  });
});
