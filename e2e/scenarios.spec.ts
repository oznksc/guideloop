import { test, expect, type Page } from '@playwright/test';

// Demo'daki senaryoların (tourSets) gerçek davranışını doğrular.
// Özellikle önceki turda düzeltilen problemler regression'a karşı korumaya alınır:
//  - modal trigger sonrası modal'ın otomatik kapanması
//  - nextDelay uygulaması
//  - condition:false adımının atlanması
//  - icon ve özel ReactNode butonlarının render edilmesi
//  - Bitir butonunun onComplete tetiklemesi

async function selectTour(page: Page, labelSubstring: string) {
  await page.getByTitle('Ayarlar').click();
  await page.locator('button', { hasText: labelSubstring }).first().click();
  await page.getByRole('button', { name: 'Start Tour' }).click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  // "Start Tour" zaten paneli kapatır; ekstra kapatma yapmaya gerek yok.
}

test.describe('Scenario: Actions & Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('modal trigger opens modal, then auto-closes when leaving the modal step', async ({ page }) => {
    await selectTour(page, 'Actions & Events');

    // Step 1 -> İleri, #show-search-features-modal tetiklenir, modal açılır
    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.locator('#alertBox')).toBeVisible();
    await expect(page.getByText(/Step 2 of 4/)).toBeVisible();

    // Step 2 -> İleri, modal dışına geçilir, modal otomatik kapanmalı
    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.locator('#alertBox')).toBeHidden();
    await expect(page.getByText(/Step 3 of 4/)).toBeVisible();
  });

  test('nextDelay is applied on the delay step', async ({ page }) => {
    await selectTour(page, 'Actions & Events');
    await page.getByRole('button', { name: 'İleri' }).click(); // modal açılır
    await expect(page.getByText(/Step 2 of 4/)).toBeVisible();
    await page.getByRole('button', { name: 'İleri' }).click(); // Step 3 (delay step), modal kapanır
    await expect(page.getByText(/Step 3 of 4/)).toBeVisible();

    const start = Date.now();
    await page.getByRole('button', { name: 'İleri' }).click(); // nextDelay 1000ms
    await expect(page.getByText(/Step 4 of 4/)).toBeVisible();
    expect(Date.now() - start).toBeGreaterThan(900);
  });

  test('full actions tour completes', async ({ page }) => {
    await selectTour(page, 'Actions & Events');
    for (let i = 1; i < 4; i++) {
      await expect(page.getByText(new RegExp(`Step ${i} of 4`))).toBeVisible();
      await page.getByRole('button', { name: 'İleri' }).click();
    }
    await expect(page.getByText('Step 4 of 4')).toBeVisible();
    await page.getByRole('button', { name: 'Bitir' }).click();
    await expect(page.locator('.guideloop-container')).not.toBeVisible();
  });
});

test.describe('Scenario: Dynamic Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('completes full dynamic tour without getting stuck on the modal step', async ({ page }) => {
    await selectTour(page, 'Dynamic Content');

    // Step 1 -> modal açılır, Step 2 (#alertBox) görünür
    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.locator('#alertBox')).toBeVisible();
    await expect(page.getByText(/Step 2 of 6/)).toBeVisible();

    // Step 2 -> İleri (artık görünür), modal kapanır
    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.locator('#alertBox')).toBeHidden();

    for (let i = 3; i <= 5; i++) {
      await expect(page.getByText(new RegExp(`Step ${i} of 6`))).toBeVisible();
      await page.getByRole('button', { name: 'İleri' }).click();
    }
    await expect(page.getByText('Step 6 of 6')).toBeVisible();
    // Son adımda "İleri" gizli, "Bitir" (finish) butonu tamamlar
    await expect(page.getByRole('button', { name: 'İleri' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Bitir' }).click();
    await expect(page.locator('.guideloop-container')).not.toBeVisible();
  });
});

test.describe('Scenario: Image & SVG (icon rendering)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('renders the inline icon on the icon step', async ({ page }) => {
    await selectTour(page, 'Image & SVG');
    await page.getByRole('button', { name: 'İleri' }).click(); // Step 2 (svg component)
    await page.getByRole('button', { name: 'İleri' }).click(); // Step 3 (icon)

    await expect(page.locator('[role="tooltip"] h3', { hasText: 'Icon Content' })).toBeVisible();
    // icon adımında yalnızca ikon svg'i render edilir (image yok)
    await expect(page.locator('[role="tooltip"] svg')).toHaveCount(1);
  });
});

test.describe('Scenario: Button customization (custom ReactNode buttons)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('renders custom ReactNode buttons and they work', async ({ page }) => {
    await selectTour(page, 'Buton Özelleştirme');

    // Step 1, 2 -> İleri (next görünür)
    await expect(page.getByText(/Step 1 of 4/)).toBeVisible();
    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.getByText(/Step 2 of 4/)).toBeVisible();
    await page.getByRole('button', { name: 'İleri' }).click();

    // Step 3 -> yalnızca Close butonu var, ilerlemek için ArrowRight
    await expect(page.getByText(/Step 3 of 4/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'İleri' })).toHaveCount(0);
    await page.keyboard.press('ArrowRight');

    // Step 4 -> özel ReactNode butonlar render edilir (prev + close)
    await expect(page.getByText(/Step 4 of 4/)).toBeVisible();
    await expect(page.locator('[role="tooltip"]').getByText('← Geri')).toBeVisible();
    await expect(page.locator('[role="tooltip"]').getByText('✕')).toBeVisible();

    // özel close (finish) butonu tour'u tamamlar
    await page.locator('[role="tooltip"]').getByText('✕').click();
    await expect(page.locator('.guideloop-container')).not.toBeVisible();
  });
});

test.describe('Scenario: Hooks & Conditions (condition-based skip)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('skips the condition:false step', async ({ page }) => {
    await selectTour(page, 'Hooks & Conditions');
    // condition:false adımı filtrelenir -> 4 geçerli adım
    await expect(page.getByText(/Step 1 of 4/)).toBeVisible();

    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.getByText(/Step 2 of 4/)).toBeVisible();
    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.getByText(/Step 3 of 4/)).toBeVisible();

    // Step 3 "Condition" adımı (#tab-section)
    await expect(page.locator('[role="tooltip"] h3', { hasText: 'Condition' })).toBeVisible();

    // İleri, condition:false adımını (#stats-section) atlayıp doğrudan #notifications'a gider
    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(page.getByText(/Step 4 of 4/)).toBeVisible();
    await expect(page.locator('[role="tooltip"] h3', { hasText: 'Async Hooks' })).toBeVisible();
  });
});

test.describe('Scenario: Finish triggers onComplete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('completing the basic tour logs "Tour tamamlandı!" (onComplete)', async ({ page }) => {
    await page.locator('#help-button').click();
    const steps = 5;
    for (let i = 1; i < steps; i++) {
      await expect(page.getByText(new RegExp(`Step ${i} of ${steps}`))).toBeVisible();
      await page.getByRole('button', { name: 'İleri' }).click();
    }
    await expect(page.getByText(`Step ${steps} of ${steps}`)).toBeVisible();
    await page.getByRole('button', { name: 'Bitir' }).click();
    await expect(page.locator('.guideloop-container')).not.toBeVisible();

    // Event Log'a bak: "Bitir" artık onComplete tetiklemeli (önceki davranış onSkip'ti)
    await page.getByTitle('Ayarlar').click();
    await page.getByText('Event Log', { exact: true }).click();
    await expect(page.getByText('Tour tamamlandı!')).toBeVisible();
  });
});
