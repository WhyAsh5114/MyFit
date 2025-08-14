import { getManifest } from 'workbox-build';
import { writeFileSync } from 'fs';
import { globPatterns } from '../../../vite.config';

const { count } = await getManifest({
	globDirectory: '.svelte-kit/output',
	globPatterns
});
const data = JSON.stringify({ count });

writeFileSync('.vercel/output/static/precache-entries.json', data);
writeFileSync('.svelte-kit/output/client/precache-entries.json', data);
