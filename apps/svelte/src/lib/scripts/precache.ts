import { writeFileSync } from 'fs';
import { getManifest } from 'workbox-build';
import { globPatterns, globIgnores } from '../../../vite.config';

const { count } = await getManifest({
	globDirectory: '.svelte-kit/output',
	globPatterns,
	globIgnores
});
const data = JSON.stringify({ count });

writeFileSync('.vercel/output/static/precache-entries.json', data);
writeFileSync('.svelte-kit/output/client/precache-entries.json', data);
