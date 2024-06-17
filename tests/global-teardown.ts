import prisma from '$lib/prisma';

export default async function globalTeardown() {
	const users = await prisma.user.findMany({
		where: { AND: [{ email: { startsWith: 'test-user-' } }, { email: { endsWith: '@myfit.com' } }] }
	});

	// Filter the users to ensure the 25-character alphanumeric part
	const testUsers = users.filter((user) => {
		const regex = /^test-user-\w{25}@myfit\.com$/;
		return regex.test(user.email);
	});

	await prisma.user.deleteMany({ where: { id: { in: testUsers.map((user) => user.id) } } });
}
