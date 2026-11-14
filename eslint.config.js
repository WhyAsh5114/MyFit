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

// `no-restricted-imports` set by a later config replaces an earlier one for the same file, so each
// file group below lists every restriction that applies to it.
const FRONTEND = 'apps/frontend/src';
const bitsUi = {
	name: 'bits-ui',
	message:
		'Import the component from `#lib/components/ui/`, which carries our styling and hit areas.'
};
// Applies everywhere: a path that climbs four folders breaks when either file moves.
const deepRelative = {
	regex: '^(\\.\\./){4,}',
	message:
		'Use an alias instead of climbing four or more folders (relative is for files of the same feature, resource or route): `#lib/*`, `#routes/*` or `#tests/*` in the frontend, `#lib/*`, `#src/*` or `#prisma/*` in the API.'
};
const restrict = (paths, patterns = []) => ({
	'no-restricted-imports': ['error', { paths, patterns: [deepRelative, ...patterns] }]
});

const importRules = [
	{
		files: ['apps/{frontend,api}/**/*.{ts,svelte}'],
		rules: restrict([])
	},
	{
		// shadcn-svelte wraps bits-ui with our tokens, 44px hit areas and translated labels.
		files: [`${FRONTEND}/**/*.{ts,svelte}`],
		ignores: [`${FRONTEND}/lib/components/ui/**`],
		rules: restrict([bitsUi])
	},
	{
		// Domain code is pure, so it can be tested with plain values and reused anywhere.
		files: [`${FRONTEND}/lib/domain/**/*.ts`],
		rules: restrict(
			[bitsUi],
			[
				{
					regex: '^(#lib/(clients|features|services|data|components)|\\$app/|@sveltejs/kit|svelte)',
					message:
						'`lib/domain` takes plain values and returns plain values. Do the I/O in the caller.'
				}
			]
		)
	},
	{
		// A load reads local data through a reader, so the keys it registers always match what it read.
		files: [`${FRONTEND}/routes/**/+layout.ts`, `${FRONTEND}/routes/**/+page.ts`],
		rules: restrict(
			[bitsUi],
			[
				{
					regex: '^#lib/clients/idb-client',
					message:
						'Read local data through a reader from `queries/`, so the load reruns when it changes.'
				}
			]
		)
	},
	{
		// Routes and their components read local data through a `load` and write through a
		// mutation hook, so every read reruns after a write or a sync.
		files: [`${FRONTEND}/routes/**/*.{svelte,svelte.ts}`],
		ignores: [
			// Known exceptions: they manage the database itself (login resets it, the sync panel
			// reads the outbox). Move that work into a service when you next change them.
			`${FRONTEND}/routes/login/components/login-form.svelte`,
			`${FRONTEND}/routes/(app)/components/sync-component.svelte`
		],
		rules: restrict(
			[
				bitsUi,
				{
					name: '@tanstack/svelte-query',
					importNames: ['useQueryClient'],
					message: 'Use a feature hook. Only the account root and logout touch the query client.'
				}
			],
			[
				{
					regex: '^#lib/clients/idb-client(\\.js)?$',
					importNames: ['getDb', 'resetDb'],
					message:
						'Read in the route `load` with a reader, and write with a mutation hook from `lib/features`.'
				}
			]
		)
	}
];

// A word in markup that isn't a unit. Units read the same in every language we ship.
const WORD = '/(?!(kcal|kg|cm|ml|mg|mcg|lb|lbs|oz|ft|in)\\b)\\b[A-Za-z]{2,}/';
const copyRules = {
	// User-visible text goes through Paraglide, in every language we ship.
	files: [`${FRONTEND}/**/*.svelte`],
	ignores: [`${FRONTEND}/lib/components/ui/**`, `${FRONTEND}/lib/icons/**`],
	rules: {
		'no-restricted-syntax': [
			'error',
			{
				selector: `SvelteElement[name.name!='title'][name.name!='style'] > SvelteText[value=${WORD}]`,
				message: "Put user-visible text in `messages/*.json` and render it with `m['key']()`."
			},
			{
				// Text directly inside {#if}, {:else}, {#each}, {#snippet}, {#await} and {#key}.
				selector: `:matches(SvelteIfBlock, SvelteElseBlock, SvelteEachBlock, SvelteSnippetBlock, SvelteAwaitPendingBlock, SvelteAwaitThenBlock, SvelteAwaitCatchBlock, SvelteKeyBlock) > SvelteText[value=${WORD}]`,
				message: "Put user-visible text in `messages/*.json` and render it with `m['key']()`."
			},
			{
				selector: `SvelteAttribute[key.name=/^(aria-label|placeholder|title|alt)$/] > SvelteLiteral[value=${WORD}]`,
				message: "Put user-visible text in `messages/*.json` and render it with `m['key']()`."
			}
		]
	}
};

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
		// Local readers are made with `defineReader`, which registers what they read. The nutrition
		// queries are remote and go through TanStack.
		files: ['apps/frontend/src/lib/features/{food-diary,user,chat}/**/queries/*.ts'],
		ignores: [
			'apps/frontend/src/lib/features/food-diary/nutrition-data/**',
			'apps/frontend/src/lib/features/assistant/chat-image/**'
		],
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
	...importRules,
	copyRules,
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
