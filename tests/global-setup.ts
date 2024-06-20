import { prisma } from '$lib/prisma';
import type { FullConfig } from '@playwright/test';
import { randomUUID } from 'crypto';
import cuid from 'cuid';

export type UserData = {
	userId: string;
	sessionToken: string;
};

async function globalSetup(config: FullConfig) {
	const testUsersData: UserData[] = Array.from({ length: config.workers }).map(() => ({
		userId: cuid(),
		sessionToken: randomUUID()
	}));

	testUsersData.forEach(async ({ userId, sessionToken }) => {
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
	});
	process.env.TEST_USERS_DATA = JSON.stringify(testUsersData);
}

export default globalSetup;
