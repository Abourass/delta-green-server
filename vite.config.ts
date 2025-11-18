import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte()],
	base: '/delta-green-server-1/',
	resolve: {
		alias: {
			'$lib': '/src/lib',
			'$components': '/src/components',
			'$data': '/src/data'
		}
	}
});
