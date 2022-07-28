import { ErrorResponse, registerUser } from '../_db';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body: AccountDetails = await request.json();

	// Try registering user, if failed, user already exists
	try {
		await registerUser(body);
		return {
			status: 201,
			body: {
				message: 'Account created successfully'
			}
		};
	} catch (err) {
		if (err instanceof ErrorResponse) {
			return {
				status: err.status,
				body: {
					message: err.message
				}
			};
		}
		return {
			status: 500,
			body: {
				message: JSON.stringify(err)
			}
		};
	}
};
