import { test, expect } from '@playwright/test';
import { setupAuth, setupMockApi } from './setup';

test('Scenario 2: Simulate new notification feed', async ({ page }) => {
  await setupAuth(page);
  const state = await setupMockApi(page);
  state.notifications = [];

  await page.goto('/notifications');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Bạn không có thông báo nào')).toBeVisible({ timeout: 15000 });

  state.notifications = [
    {
      _id: 'n-2',
      id: 'n-2',
      type: 'message',
      message: 'vua gui tin nhan',
      displayText: 'vừa gửi tin nhắn',
      isRead: false,
      senderName: 'Tran Lan',
      senderId: { _id: 'u-3', id: 'u-3', displayName: 'Tran Lan' },
      createdAt: new Date().toISOString(),
    },
  ];

  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('vừa gửi tin nhắn')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Chưa đọc')).toHaveCount(1);
});
