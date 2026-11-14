import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types';

/** A food from your history opens at `history/:entryId`, so the bare route returns to the search. */
export const load: PageLoad = ({ params }) => {
	redirect(307, resolve(`food-diary/${params.date}/add-food`));
};
