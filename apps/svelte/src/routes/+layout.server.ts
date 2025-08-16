import { building, dev } from '$app/environment';
import { getStepRoutesMap } from '$root/scripts/create-routes';

export async function load({ fetch }) {
	const stepRoutesMap = await getStepRoutesMap({ dev, building, fetch });
	return { stepRoutesMap };
}
