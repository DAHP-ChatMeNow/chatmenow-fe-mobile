import { test, expect } from '@playwright/test';
import { setupAuth, setupMockApi } from './setup';

test('Scenario 4: Mark all notifications as read', async ({ page }) => {
  await setupAuth(page);
  await setupMockApi(page);
  await page.goto('/notifications');
  await page.waitForLoadState('networkidle');

  // wait for the unread state to render by checking the unread badge text in the list
  await expect(page.getByText('Chưa đọc')).toHaveCount(1);
  await page.getByRole('button', { name: 'Đánh dấu đã đọc tất cả' }).click();

  await expect(page.getByText('Đã đánh dấu tất cả thông báo là đã đọc')).toBeVisible();
  await expect(page.getByText('Đã đọc', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa đọc')).toHaveCount(0);
});
