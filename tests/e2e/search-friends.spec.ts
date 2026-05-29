import { test, expect } from '@playwright/test';
import { setupAuth, setupMockApi } from './setup';

test('Scenario 3: Search friends', async ({ page }) => {
  await setupAuth(page);
  await setupMockApi(page);
  await page.goto('/contacts');

  const searchBox = page.getByPlaceholder('Tìm bạn bè...');
  await searchBox.fill('Minh');

  await expect(page.getByText('Nguyen Minh')).toBeVisible();
  await expect(page.getByText('Tran Lan')).toHaveCount(0);

  await searchBox.clear();

  await expect(page.getByText('Nguyen Minh')).toBeVisible();
  await expect(page.getByText('Tran Lan')).toBeVisible();
});
