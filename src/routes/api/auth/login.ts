import { loginUser, getUser } from '../_db';
import type { RequestHandler } from '@sveltejs/kit';
import { serialize } from 'cookie';

export const POST: RequestHandler = async ({ request }) => {
	const body: { username: string; password: string } = await request.json();

	// Make sure user exists, otherwise return 404
	try {
		await getUser(body.username);
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
		const id = await loginUser(body);
		return {
			status: 200,
			headers: {
				'set-cookie': serialize('session_id', id, {
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 * 7,
					path: '/',
					httpOnly: true,
					secure: true
				})
			},
			body: {
				message: 'Logged in successfully'
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
