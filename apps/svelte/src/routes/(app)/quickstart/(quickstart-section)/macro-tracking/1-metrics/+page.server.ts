import { superValidate } from 'sveltekit-superforms';
import { macroTrackingMetricsSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';

export async function load() {
	return {
		form: await superValidate(zod(macroTrackingMetricsSchema))
	};
}
