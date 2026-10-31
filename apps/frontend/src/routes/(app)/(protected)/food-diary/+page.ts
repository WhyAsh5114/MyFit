import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { getLocalTimeZone, today } from '@internationalized/date';
import type { PageLoad } from './$types';

/** The diary is always a day, so this route only sends visitors to today. */
export const load: PageLoad = () => {
	redirect(307, resolve(`food-diary/${today(getLocalTimeZone()).toString()}`));
};
