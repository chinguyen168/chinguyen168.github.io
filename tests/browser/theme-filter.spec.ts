import { test, expect } from '@playwright/test';

// Keep assertions at the browser interface: rendered content, controls, and persistence.
test('fresh visits default dark and ordinary clicks do not persist a theme', async ({
  page,
}) => {
  await page.goto('/');
  const dark = page.getByRole('button', { name: 'Dark theme', exact: true });
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).not.toHaveAttribute('aria-pressed');
  await page.getByRole('heading', { level: 1 }).click();
  expect(
    await page.evaluate(() => localStorage.getItem('np-theme')),
  ).toBeNull();
});

test('theme selection updates both controls and survives reload and navigation', async ({
  page,
}) => {
  await page.goto('/');
  const light = page.getByRole('button', { name: 'Light theme', exact: true });
  const dark = page.getByRole('button', { name: 'Dark theme', exact: true });
  await light.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(light).toHaveAttribute('aria-pressed', 'true');
  await expect(dark).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => localStorage.getItem('np-theme'))).toBe(
    'light',
  );
  await page.reload();
  await expect(light).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: /About & experience/ }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await dark.click();
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await expect(light).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => localStorage.getItem('np-theme'))).toBe(
    'dark',
  );
  await expect(page.locator('html')).not.toHaveAttribute('aria-pressed');
});

test('saved light initializes without the interactive module scripts', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('np-theme', 'light'));
  // Astro may inline small processed scripts. Remove both inline and external
  // module scripts so only the synchronous head initializer can apply the theme.
  await page.route('**/', async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      /<script\b[^>]*\btype=["']module["'][^>]*>[\s\S]*?<\/script>/gi,
      '',
    );
    await route.fulfill({ response, body: html });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(
    page.getByRole('button', { name: 'Light theme', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
});

test('theme selection still works when storage access is blocked', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem']) {
      Object.defineProperty(Storage.prototype, method, {
        value() {
          throw new DOMException('Storage blocked', 'SecurityError');
        },
      });
    }
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Light theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(
    page.getByRole('button', { name: 'Light theme', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

for (const path of ['/blog/', '/til/']) {
  test(`${path} combines normalized search and topic, announces results, and resets`, async ({
    page,
  }) => {
    await page.goto(path);
    const list = page.locator('[data-post-list]');
    const visible = list.locator('[data-post-card]:visible');
    const search = page.getByRole('searchbox', { name: 'Search posts' });
    const status = list.locator('[data-search-status]');
    await expect(search).toBeVisible();
    await expect(visible).toHaveCount(3);
    await search.fill('  jAvA  ');
    await expect(visible).toHaveCount(2);
    await expect(status).toHaveText('2 posts found');
    await page.getByRole('button', { name: 'Git', exact: true }).click();
    await expect(visible).toHaveCount(0);
    await expect(status).toHaveText('0 posts found');
    await expect(
      page.getByText('No posts found. Try another search or topic.'),
    ).toBeVisible();
    await search.fill('');
    await expect(visible).toHaveCount(1);
    await expect(visible).toContainText('Git shortcuts');
    await expect(status).toHaveText('1 post found');
    await page.getByRole('button', { name: 'Java', exact: true }).click();
    await expect(visible).toHaveCount(2);
    await expect(
      page.getByRole('button', { name: 'Git', exact: true }),
    ).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.getByRole('button', { name: 'Java', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'All topics', exact: true }).click();
    await expect(visible).toHaveCount(3);
    await expect(status).toHaveText('3 posts found');
    await expect(
      page.getByText('No posts found. Try another search or topic.'),
    ).toBeHidden();
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('posts and navigation remain usable', async ({ page }) => {
    await page.goto('/blog/');
    await expect(page.locator('[data-post-card]:visible')).toHaveCount(3);
    await expect(
      page.getByRole('searchbox', { name: 'Search posts' }),
    ).toBeHidden();
    await page
      .getByRole('link')
      .filter({
        has: page.getByRole('heading', { name: 'Java contracts', exact: true }),
      })
      .click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Java contracts' }),
    ).toBeVisible();
  });
});
