import { removeSession } from '../_db';
import { parse, serialize } from 'cookie';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	// Check if cookie exists, if yes, remove it from DB
	const cookies = parse(request.headers.get('set-cookie') || '');

	if (cookies.session_id) {
		await removeSession(cookies.session_id);
	}

	// Return 201, and overwrite cookie in browser to expire immediately
	return {
		status: 201,
		headers: {
			'set-cookie': serialize('session_id', '', {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 0
			})
		}
	};
};
