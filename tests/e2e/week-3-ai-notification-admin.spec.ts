import { expect, test } from '@playwright/test';
import { setupAdminMocks } from './weekly-fixtures';
import { setupAuth, setupMockApi } from './setup';

test('Week 3 - notifications show unread and can mark all as read', async ({ page }) => {
  await setupAuth(page);
  await setupMockApi(page);
  await page.goto('/notifications');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('Chưa đọc', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Đánh dấu đã đọc tất cả' }).click();

  await expect(page.getByText('Đã đánh dấu tất cả thông báo là đã đọc')).toBeVisible();
  await expect(page.getByText('Đã đọc', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa đọc', { exact: true })).toHaveCount(0);
});

test('Week 3 - admin dashboard loads stats', async ({ page }) => {
  await setupAdminMocks(page);
  await page.goto('/admin/dashboard');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible();
  await expect(page.getByText('Tổng người dùng')).toBeVisible();
  await expect(page.getByText('128')).toBeVisible();
  await expect(page.getByText('104')).toBeVisible();
});

test('Week 3 - admin users page loads user table', async ({ page }) => {
  await setupAdminMocks(page);
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('Quản lý người dùng')).toBeVisible();
  await expect(page.getByPlaceholder('Tìm theo tên, email...')).toBeVisible();
  await expect(page.getByText('Nguyen Minh')).toBeVisible();
});

test('Week 3 - AI config can be updated', async ({ page }) => {
  await setupAdminMocks(page);
  await page.goto('/admin/ai');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Quản lý AI Chat' })).toBeVisible();
  await page.getByPlaceholder('ChatMeNow Assistant').fill('E2E Bot');
  await page.getByPlaceholder('Trợ lý AI hỗ trợ người dùng.').fill(
    'Bot mô phỏng cho kiểm thử Playwright.',
  );
  await page.getByRole('button', { name: 'Lưu cấu hình' }).click();

  await expect(page.getByText('Đã cập nhật cấu hình AI chat')).toBeVisible();
});
