import { test, expect } from '@playwright/test';
import { setupAuth, setupMockApi } from './setup';

test('Scenario 1: Accept friend request', async ({ page }) => {
  await setupAuth(page);
  await setupMockApi(page);
  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Danh bạ' })).toBeVisible();
  // the contacts page shows a tile labelled 'Lời mời' that opens the modal
  await page.getByText('Lời mời', { exact: true }).click();
  await expect(page.getByRole('heading', { name: /Lời mời kết bạn/i })).toBeVisible();

  await page.getByRole('button', { name: 'Chấp nhận' }).first().click();

  await expect(page.getByText('Đã chấp nhận lời mời kết bạn')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Chấp nhận' })).toHaveCount(0);

  await page.keyboard.press('Escape');
  await expect(page.getByText('0', { exact: true })).toBeVisible();
});
