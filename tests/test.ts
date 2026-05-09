import { expect, test } from '@playwright/test';

test('home page renders secure server heading', async ({ page }) => {
	await page.goto('');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Secure Server');
});

test('terminal tuning panel can be opened and toggled', async ({ page }) => {
	await page.goto('');

	await page.getByRole('button', { name: /TUNING/ }).click();
	await expect(page.getByLabel('Terminal authenticity controls')).toBeVisible();

	const reducedMotion = page.getByLabel('Reduced Motion');
	await reducedMotion.check();
	await expect(reducedMotion).toBeChecked();
});
