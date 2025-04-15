import { building, dev } from '$app/environment';
import { getStepRoutesMap } from '$lib/scripts/routes';

export async function load({ fetch }) {
	const stepRoutesMap = await getStepRoutesMap({ dev, building, fetch });
	return { stepRoutesMap };
}
