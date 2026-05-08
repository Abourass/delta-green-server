import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			dynamicCompileOptions: ({ filename, compileOptions }) => {
				if (filename.includes('svelte-typewriter') && compileOptions.runes) {
					return { runes: false };
				}

				return undefined;
			}
		})
	],
	base: '/delta-green-server-1/',
	resolve: {
		alias: {
			$lib: '/src/lib',
			$components: '/src/components',
			$data: '/src/data'
		}
	}
});
