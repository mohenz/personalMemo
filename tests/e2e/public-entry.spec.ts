import { expect, test } from '@playwright/test';

test('renders the public entry without layout or runtime errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle('MEMOry');
  await expect(page.getByRole('heading', { name: 'MEMOry' })).toBeVisible();
  await expect(page.getByLabel('이메일')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByLabel('비밀번호')).toBeVisible();
  await expect(page.getByRole('button', { name: '통합 계정으로 시작' })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );

  expect(hasHorizontalOverflow).toBe(false);
  expect(pageErrors).toEqual([]);
});
