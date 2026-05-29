import { expect, test, type Page } from '@playwright/test';
import {
  setupLoginMocks,
  setupProfileMocks,
  setupSignupMocks,
  setupTurnstileMock,
} from './weekly-fixtures';
import { setupAuth } from './setup';

async function enterOtp(page: Page, otp: string) {
  const inputs = page.locator('input[maxlength="1"]');
  for (let index = 0; index < otp.length; index += 1) {
    await inputs.nth(index).fill(otp[index]);
  }
}

test('Week 1 - signup validation and successful registration', async ({ page }) => {
  await setupTurnstileMock(page);
  await setupSignupMocks(page);
  await page.goto('/signup');

  await page.getByPlaceholder('example@gmail.com').fill('not-an-email');
  await page.getByRole('button', { name: 'Gửi mã xác thực' }).click();

  await expect(page.getByText('Mã xác thực đã được gửi đến')).toHaveCount(0);

  await page.getByPlaceholder('example@gmail.com').fill('e2e.user@example.com');
  await page.getByRole('button', { name: 'Gửi mã xác thực' }).click();
  await expect(page.getByText('Mã xác thực đã được gửi đến')).toBeVisible();

  await enterOtp(page, '123456');
  await expect(page.getByText('Email đã xác thực')).toBeVisible();

  await page.getByPlaceholder('Nguyễn Văn A').fill('E2E User');
  await page.getByPlaceholder('Nhập mật khẩu của bạn').fill('StrongPass123');
  await page.getByPlaceholder('Nhập lại mật khẩu của bạn').fill('StrongPass123');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Đăng ký' }).click();

  await page.waitForURL(/\/messages$/);
  await expect(page).not.toHaveURL(/\/signup/);
  await expect(page.getByText('Chưa chọn cuộc hội thoại')).toBeVisible();
});

test('Week 1 - login rejects wrong password', async ({ page }) => {
  await setupLoginMocks(page);
  await page.goto('/login');

  await page.getByPlaceholder('example@email.com').fill('e2e.user@example.com');
  await page.getByPlaceholder('Nhập mật khẩu của bạn').fill('wrongpass');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await expect(page.getByText('Sai mật khẩu')).toBeVisible();
});

test('Week 1 - login success and logout', async ({ page }) => {
  await setupLoginMocks(page);
  await page.goto('/login');

  await page.getByPlaceholder('example@email.com').fill('e2e.user@example.com');
  await page.getByPlaceholder('Nhập mật khẩu của bạn').fill('StrongPass123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await page.waitForURL(/\/messages$/);
  await expect(page.getByText('Chưa chọn cuộc hội thoại')).toBeVisible();

  await page.goto('/settings');
  await expect(page.getByRole('button', { name: 'Đăng xuất' })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất' }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
});

test('Week 1 - profile edit updates display name', async ({ page }) => {
  await setupAuth(page);
  await setupProfileMocks(page);
  await page.goto('/profile');

  await expect(page.getByRole('heading', { name: 'E2E User' })).toBeVisible();

  await page.getByRole('button', { name: /Chỉnh sửa hồ sơ/i }).click();
  await page.getByPlaceholder('Nhập tên của bạn').fill('E2E User Updated');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('heading', { name: 'E2E User Updated' })).toBeVisible();
});
