import { expect, test } from '@playwright/test';
import { setupContentMocks } from './weekly-fixtures';

const SOCIAL_POST = 'Week 2 social post';

test('Week 2 - chat root shows empty state', async ({ page }) => {
  await setupContentMocks(page);
  await page.goto('/messages');

  await expect(page.getByText('Chưa chọn cuộc hội thoại')).toBeVisible();
  await expect(page.getByText('Chọn một người bạn từ danh sách bên trái để bắt đầu trò chuyện ngay.')).toBeVisible();
});

test('Week 2 - create post, like and comment', async ({ page }) => {
  await setupContentMocks(page);
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('Week 2 sample post')).toBeVisible();

  await page.getByRole('button', { name: 'Thích' }).first().click();
  await page.getByPlaceholder('Viết bình luận...').first().fill('Binh luan week 2');
  await page.getByRole('button', { name: 'Bình luận' }).first().click();

  await expect(page.getByText('Binh luan week 2')).toBeVisible();

  await page.getByPlaceholder('Bạn đang nghĩ gì thế?').fill(SOCIAL_POST);
  await page.getByRole('button', { name: 'Đăng bài' }).click();

  await expect(page.getByText(SOCIAL_POST)).toBeVisible();
});

test('Week 2 - reels modal opens from the FAB', async ({ page }) => {
  await setupContentMocks(page);
  await page.goto('/reels');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Tạo Reel mới').click();
  await expect(page.getByText('Tạo Reel')).toBeVisible();
});
