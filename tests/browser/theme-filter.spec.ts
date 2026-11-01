import { test, expect } from '@playwright/test';

for (const colorScheme of ['light', 'dark'] as const) {
  test(`fresh visits follow ${colorScheme} system appearance`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    const theme = page.getByRole('combobox', { name: 'Theme', exact: true });
    await expect(theme).toHaveValue('system');
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      colorScheme,
    );
    await page.getByRole('heading', { level: 1 }).click();
    expect(
      await page.evaluate(() => localStorage.getItem('np-theme')),
    ).toBeNull();
  });
  test(`saved ${colorScheme} initializes before interactive scripts`, async ({
    page,
  }) => {
    await page.emulateMedia({
      colorScheme: colorScheme === 'light' ? 'dark' : 'light',
    });
    await page.addInitScript(
      (theme) => localStorage.setItem('np-theme', theme),
      colorScheme,
    );
    await page.route('**/', async (route) => {
      const response = await route.fetch();
      const html = (await response.text()).replace(
        /<script\b[^>]*\btype=["']module["'][^>]*>[\s\S]*?<\/script>/gi,
        '',
      );
      await route.fulfill({ response, body: html });
    });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      colorScheme,
    );
    await expect(
      page.getByRole('combobox', { name: 'Theme', exact: true }),
    ).toBeHidden();
  });
}

test('footer dropdown persists explicit choices and System follows live changes', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const theme = page
    .getByRole('contentinfo')
    .getByRole('combobox', { name: 'Theme', exact: true });
  await theme.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(theme).toHaveValue('light');
  await page.getByRole('link', { name: /About & experience/ }).click();
  await expect(theme).toHaveValue('light');
  await theme.selectOption('dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(theme).toHaveValue('dark');
  await theme.selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(theme).toHaveValue('system');
  expect(await page.evaluate(() => localStorage.getItem('np-theme'))).toBe(
    'system',
  );
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('theme dropdown supports keyboard selection', async ({ page }) => {
  await page.goto('/');
  const theme = page.getByRole('combobox', { name: 'Theme', exact: true });
  await expect(theme).toBeVisible();
  await theme.focus();
  await expect(theme).toBeFocused();
  await theme.press('l');
  await theme.press('Enter');
  await expect(theme).toHaveValue('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
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
  const theme = page.getByRole('combobox', { name: 'Theme', exact: true });
  await theme.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await theme.selectOption('system');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
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

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`CSS follows ${colorScheme} appearance without JavaScript`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/');
      await expect(page.locator('body')).toHaveCSS(
        'background-color',
        colorScheme === 'dark' ? 'rgb(17, 24, 23)' : 'rgb(248, 247, 243)',
      );
      await expect(
        page.getByRole('combobox', { name: 'Theme', exact: true }),
      ).toBeHidden();
    });
  }

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
