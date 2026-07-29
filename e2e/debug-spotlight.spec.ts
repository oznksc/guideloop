import { expect, test } from '@playwright/test';

test('debug spotlight positioning', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Scroll playground into view
  await page.locator('#live').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  // Click Target Search
  await page.locator('#live').getByRole('button', { name: 'Target Search' }).click();
  await expect(page.getByRole('dialog', { name: 'Guided tour' })).toBeVisible();
  await page.waitForTimeout(600);

  // Debug: get computed styles and positions from the page
  const debugInfo = await page.evaluate(() => {
    const target = document.querySelector('#test-search');
    const spotlightGlow = document.querySelector('.guideloop-spotlight');
    const overlayContainer = spotlightGlow?.parentElement;
    
    const targetRect = target?.getBoundingClientRect();
    const spotlightRect = spotlightGlow?.getBoundingClientRect();
    const spotlightStyle = spotlightGlow ? window.getComputedStyle(spotlightGlow) : null;
    const containerStyle = overlayContainer ? window.getComputedStyle(overlayContainer) : null;
    
    return {
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      target: targetRect ? {
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
      } : null,
      spotlight: spotlightRect ? {
        top: spotlightRect.top,
        left: spotlightRect.left,
        width: spotlightRect.width,
        height: spotlightRect.height,
      } : null,
      spotlightComputedPosition: spotlightStyle?.position,
      spotlightComputedTop: spotlightStyle?.top,
      spotlightComputedLeft: spotlightStyle?.left,
      containerPosition: containerStyle?.position,
      containerTop: containerStyle?.top,
      containerHTML: overlayContainer?.tagName,
      containerClassName: overlayContainer?.className,
    };
  });

  console.log('DEBUG INFO:', JSON.stringify(debugInfo, null, 2));
  
  // This test is for debugging only - always pass
  expect(true).toBe(true);
});
