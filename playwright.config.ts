import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		baseURL: 'http://127.0.0.1:4173/delta-green-server-1/'
	},
	webServer: {
		command: 'pnpm build && pnpm preview --host 127.0.0.1 --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
