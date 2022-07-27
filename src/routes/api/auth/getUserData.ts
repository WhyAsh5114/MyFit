import { getUser, loginUser } from '../_db';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body: { username: string; password: string } = await request.json();

	// Make sure user exists, otherwise return 404
	let userData;
	try {
		userData = await getUser(body.username);
	} catch (err) {
		return {
			status: 404,
			body: {
				message: 'User does not exist'
			}
		};
	}

	// Try logging in the user, if failed, return 403
	try {
		await loginUser(body);
		return {
			status: 200,
			body: {
				user: JSON.stringify(userData)
			}
		};
	} catch (err) {
		return {
			status: 403,
			body: {
				message: 'Incorrect password'
			}
		};
	}
};
