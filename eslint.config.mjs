import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig(
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs['flat/recommended'],
	prettier,
	svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	}
);
