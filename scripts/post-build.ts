import { writeFileSync } from 'fs';
import { getManifest } from 'workbox-build';
import { globPatterns, globIgnores } from '../vite.config';
import { findStepRoutes } from './create-routes';

async function runPostBuild() {
	console.log('Running post-build tasks...');

	// 1. Generate precache entries
	console.log('Generating precache entries...');
	const { count } = await getManifest({
		globDirectory: '.svelte-kit/output',
		globPatterns,
		globIgnores
	});
	const precacheData = JSON.stringify({ count });

	writeFileSync('.vercel/output/static/precache-entries.json', precacheData);
	writeFileSync('.svelte-kit/output/client/precache-entries.json', precacheData);
	console.log(`✓ Generated precache entries (${count} files)`);

	// 2. Generate step routes
	console.log('Generating step routes...');
	const stepRoutesMap = findStepRoutes();
	const stepRoutesData = JSON.stringify(stepRoutesMap);

	writeFileSync('.vercel/output/static/step-routes.json', stepRoutesData);
	writeFileSync('.svelte-kit/output/client/step-routes.json', stepRoutesData);
	console.log('✓ Generated step routes');

	console.log('Post-build tasks completed!');
}

runPostBuild().catch((error) => {
	console.error('Post-build failed:', error);
	process.exit(1);
});
