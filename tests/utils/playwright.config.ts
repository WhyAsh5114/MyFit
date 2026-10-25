import { defineConfig } from '@playwright/test';

// Pure utility tests do not need the app server or database-backed authentication fixtures.
export default defineConfig({
	testDir: '.',
	testMatch: '*.spec.ts',
	reporter: 'list'
});
