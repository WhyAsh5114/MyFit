import { building, dev } from '$app/environment';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { getStepRoutesMap } from '$lib/scripts/routes';

export async function load() {
	const stepRoutesMap = await getStepRoutesMap({ dev, building, url: PUBLIC_BETTER_AUTH_URL });
	return { stepRoutesMap };
}
