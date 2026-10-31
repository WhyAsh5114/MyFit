import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types';

/** An entry is edited at `edit-food/:entryId`, so the bare route returns to the day. */
export const load: PageLoad = ({ params }) => {
	redirect(307, resolve(`food-diary/${params.date}`));
};
