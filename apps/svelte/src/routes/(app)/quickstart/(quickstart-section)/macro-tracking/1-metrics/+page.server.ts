import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';

export async function load() {
	return {
		form: await superValidate(zod(formSchema))
	};
}
