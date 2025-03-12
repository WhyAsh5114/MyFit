import { getManifest } from '@serwist/build';
import { writeFileSync } from 'fs';
import { globPatternsAndIgnores } from '../vite.config';

const { ...config } = {
	globDirectory: '.svelte-kit/output',
	...globPatternsAndIgnores
};

const { count } = await getManifest(config);
const data = JSON.stringify({ count });

writeFileSync('.svelte-kit/output/client/precache-entries.json', data);
