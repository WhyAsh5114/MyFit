import prisma from '$lib/prisma';

export default async function globalTeardown() {
	const users = await prisma.user.findMany({
		where: {
			AND: [
				{ email: { startsWith: 'test-user-' } },
				{ email: { endsWith: '@myfit.com' } },
				{ email: { contains: '-@myfit.com', not: '' } } // Ensure the 24-character part exists
			]
		}
	});

	// Filter the users to ensure the 24-character alphanumeric part
	const testUsers = users.filter((user) => {
		const regex = /^test-user-\w{24}@myfit\.com$/;
		return regex.test(user.email);
	});

	await prisma.user.deleteMany({ where: { id: { in: testUsers.map((user) => user.id) } } });
}
