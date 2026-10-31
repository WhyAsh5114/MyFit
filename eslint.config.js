import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');
const frontendGitignorePath = path.resolve(import.meta.dirname, 'apps/frontend/.gitignore');
const apiGitignorePath = path.resolve(import.meta.dirname, 'apps/api/.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		basePath: 'apps/frontend',
		ignores: [
			...includeIgnoreFile(frontendGitignorePath).ignores,
			'android',
			'ios',
			'src/lib/components/ui'
		]
	},
	{
		basePath: 'apps/api',
		ignores: [...includeIgnoreFile(apiGitignorePath).ignores]
	},
	{
		// Emitted by `prisma contract emit` and the migration planner
		basePath: 'packages/shared',
		ignores: ['migrations/**', 'migrations-postgres/**', 'src/generated/**']
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		// A load reads local data through a reader, so the keys it registers always match what it read.
		files: ['apps/frontend/src/routes/**/+layout.ts', 'apps/frontend/src/routes/**/+page.ts'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							regex: '^#lib/clients/idb-client',
							message:
								'Read local data through a reader from `queries/`, so the load reruns when it changes.'
						}
					]
				}
			]
		}
	},
	{
		// Local readers are made with `defineReader`, which registers what they read. The nutrition
		// queries are remote and go through TanStack.
		files: ['apps/frontend/src/lib/features/{food-diary,user}/**/queries/*.ts'],
		ignores: ['apps/frontend/src/lib/features/food-diary/nutrition-data/**'],
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: 'ExportNamedDeclaration > FunctionDeclaration, ExportDefaultDeclaration',
					message: 'Define a reader with `defineReader`, so it registers the keys it reads.'
				},
				{
					selector:
						"ExportNamedDeclaration > VariableDeclaration > VariableDeclarator:not([init.callee.name='defineReader'])",
					message: 'Define a reader with `defineReader`, so it registers the keys it reads.'
				}
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	}
);
