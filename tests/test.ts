import { expect, test } from '@playwright/test';

test('home page renders secure server heading', async ({ page }) => {
	await page.goto('');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Secure Server');
});
