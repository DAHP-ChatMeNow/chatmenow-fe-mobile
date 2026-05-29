import { test, expect } from '@playwright/test';
import { setupAuth, setupMockApi } from './setup';

test('Scenario 5: Remove friend', async ({ page }) => {
  await setupAuth(page);
  await setupMockApi(page);
  await page.goto('/contacts');

  await page.getByText('Nguyen Minh').first().hover();

  page.once('dialog', (dialog) => {
    void dialog.accept();
  });

  await page.locator('button[title="Xóa bạn"]').first().click();

  await expect(page.getByText('Đã xóa bạn')).toBeVisible();
  await expect(page.getByText('Nguyen Minh')).toHaveCount(0);
});
