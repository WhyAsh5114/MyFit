import { building, dev } from '$app/environment';
import { getStepRoutesMap } from '../../scripts/create-routes';

export async function load({ fetch }) {
	const stepRoutesMap = await getStepRoutesMap({ dev, building, fetch });
	return { stepRoutesMap };
}
