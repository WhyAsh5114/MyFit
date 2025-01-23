import { prisma } from '../src/lib/prisma';
import type { UserData } from './global-setup';

export default async function globalTeardown() {
	const testUsersData: UserData[] = JSON.parse(process.env.TEST_USERS_DATA as string);

	await prisma.user.deleteMany({
		where: { id: { in: testUsersData.map(({ userId }) => userId) } }
	});

	await prisma.user.deleteMany({
		where: {
			email: {
				startsWith: 'test-user-',
				endsWith: '@myfit.com'
			}
		}
	});
}
