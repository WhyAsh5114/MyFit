import { prisma } from '$lib/prisma';
import { randomUUID } from 'crypto';
import { createId } from '@paralleldrive/cuid2';

export type UserData = {
	userId: string;
	sessionToken: string;
};

async function createUser() {
	const userId = createId();
	const sessionToken = randomUUID();

	await prisma.session.create({
		data: {
			sessionToken,
			expires: new Date(Number(new Date()) + 1000 * 60 * 60),
			user: {
				create: {
					id: userId,
					email: `test-user-${userId}@myfit.com`,
					emailVerified: null
				}
			}
		}
	});

	console.log({ userId, sessionToken });
}

// Set the logged output's sessionToken as a cookie value in the browser
// with the following structure:
/*
  {
    "name": "authjs.session-token",
    "value": {sessionToken},
    "domain": "localhost",
    "path": "/",
    "expires": -1,
    "httpOnly": true,
    "secure": false,
    "sameSite": "Lax"
  }
*/
createUser();
