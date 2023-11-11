import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

const unprotectedRoutes = ["/", "/login"];

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.getSession();

	if (!session && !unprotectedRoutes.includes(event.url.pathname)) {
		throw redirect(303, `/login?callbackURL=${event.url.pathname}`);
	}
	return {
		session
	};
};
