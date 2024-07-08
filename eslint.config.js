import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	{ ignores: ['.vercel/', '.svelte-kit/', 'postcss.config.cjs', 'src/lib/components/ui/'] },
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/all'],
	prettier,
	...svelte.configs['flat/prettier'],
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	{
		files: ['**/*.svelte'],
		languageOptions: { parserOptions: { parser: ts.parser } }
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			],
			'svelte/no-at-html-tags': 'off',
			'svelte/block-lang': ['error', { script: ['ts'], style: ['postcss'] }],
			'svelte/experimental-require-strict-events': 'off',
			'svelte/no-unused-class-name': 'off',
			'svelte/no-goto-without-base': 'off',
			'svelte/require-each-key': 'off',
			'svelte/no-inline-styles': ['error', { allowTransitions: true }],
			'svelte/prefer-destructured-store-props': 'off',
			'svelte/experimental-require-slot-types': 'off'
		}
	}
];
