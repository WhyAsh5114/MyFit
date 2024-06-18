import prisma from '$lib/prisma';

export const GET = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return new Response('Not logged in', { status: 401 });

	const mesocycle = prisma.mesocycle.findUnique({
		where: { userId: session.user.id, id: params.mesocycleId }
	});

	return new Response(JSON.stringify(mesocycle), { status: 200 });
};
