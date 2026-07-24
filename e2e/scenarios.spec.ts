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

function checklist(page: Page) {
  return page.getByRole('region', {
    name: 'GuideLoop demo getting started checklist',
  });
}

test.describe('Embedded onboarding experience', () => {
  test.beforeEach(async ({ page }) => {
    await openFreshLanding(page);
  });

  test('starts at one of five completed steps', async ({ page }) => {
    const onboarding = checklist(page);

    await expect(onboarding.getByText('1 of 5 steps completed')).toBeVisible();
    await expect(
      onboarding.getByRole('button', { name: /Open the demo interface/ })
    ).toHaveAttribute('data-state', 'success');
  });

  test('validates a modal task and clears the error after a successful retry', async ({
    page,
  }) => {
    const onboarding = checklist(page);
    await onboarding
      .getByRole('button', { name: /Create a milestone/ })
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
    await expect(onboarding.getByText('2 of 5 steps completed')).toBeVisible();
    const milestoneTask = onboarding.getByRole('button', {
      name: /Create a milestone/,
    });
    await expect(milestoneTask).toHaveAttribute('data-state', 'success');
    await expect(
      onboarding.getByText('Complete a focused modal task.')
    ).toBeVisible();
    await expect(
      onboarding.getByText('Enter a milestone name to continue.')
    ).toHaveCount(0);
  });

  test('completes a link task and restores it after reload', async ({ page }) => {
    const onboarding = checklist(page);
    await onboarding
      .getByRole('link', { name: /Review the React integration/ })
      .click();

    await expect(page).toHaveURL(/#integration$/);
    await expect(onboarding.getByText('2 of 5 steps completed')).toBeVisible();
    await page.reload();
    await expect(checklist(page).getByText('2 of 5 steps completed')).toBeVisible();
  });

  test('runs a custom task through the command palette', async ({ page }) => {
    const onboarding = checklist(page);
    const customTask = onboarding.getByRole('button', {
      name: /Open the command palette/,
    });
    await customTask.click();

    const palette = page.getByRole('dialog', { name: 'Command palette' });
    await expect(palette).toBeVisible();
    await expect(palette.getByRole('combobox')).toBeFocused();
    await expect(onboarding.getByText('2 of 5 steps completed')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();
    await expect(customTask).toBeFocused();
  });

  test('filters and executes commands from the keyboard', async ({ page }) => {
    const trigger = page
      .getByRole('button', { name: 'Open command palette' })
      .first();
    await trigger.click();

    const palette = page.getByRole('dialog', { name: 'Command palette' });
    const search = palette.getByRole('combobox');
    await search.fill('React integration');
    await expect(
      palette.getByRole('option', { name: /Review the React integration/ })
    ).toBeVisible();
    await page.keyboard.press('Enter');

    await expect(palette).toBeHidden();
    await expect(page.locator('#integration')).toBeFocused();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Tours and checklists, working together.',
      })
    ).toBeInViewport();
  });

  test('supports the command shortcut and restores focus on Escape', async ({
    page,
  }) => {
    const trigger = page
      .getByRole('button', { name: 'Open command palette' })
      .first();
    await trigger.focus();
    await page.keyboard.press('Control+K');

    const palette = page.getByRole('dialog', { name: 'Command palette' });
    await expect(palette).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('resets persisted onboarding progress', async ({ page }) => {
    const onboarding = checklist(page);
    await onboarding
      .getByRole('link', { name: /Review the React integration/ })
      .click();
    await expect(onboarding.getByText('2 of 5 steps completed')).toBeVisible();

    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(checklist(page).getByText('1 of 5 steps completed')).toBeVisible();
    await page.reload();
    await expect(checklist(page).getByText('1 of 5 steps completed')).toBeVisible();
  });

  test('keeps every workspace control functional', async ({ page }) => {
    await page.getByRole('button', { name: 'Timeline', exact: true }).click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Launch timeline' })
    ).toBeVisible();
    await expect(page.getByText('Design lock')).toBeVisible();

    await page.getByRole('button', { name: 'View team', exact: true }).click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Launch team' })
    ).toBeVisible();
    await expect(page.getByText('Product lead')).toBeVisible();

    await page.getByRole('button', { name: 'Back to board' }).click();
    const milestoneInput = page.getByRole('textbox', { name: 'Milestone name' });
    await milestoneInput.fill('Release candidate');
    await page.getByRole('button', { name: 'Add milestone' }).click();
    await expect(page.getByText('Release candidate', { exact: true })).toBeVisible();
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

    await expect(page.getByText('Getting started', { exact: true })).toBeVisible();

    await page.setViewportSize({ width: 320, height: 844 });
    const target = page.locator('#search-bar');
    await expect(target).toBeVisible();
    const targetBox = await target.boundingBox();
    expect(targetBox).not.toBeNull();
    expect(targetBox!.width).toBeGreaterThan(0);
    expect(targetBox!.x).toBeGreaterThanOrEqual(0);
    expect(targetBox!.x + targetBox!.width).toBeLessThanOrEqual(320);

    await page.getByRole('button', { name: 'Start tour' }).click();
    await expect(page.getByRole('dialog', { name: 'Guided tour' })).toBeVisible();
  });
});
