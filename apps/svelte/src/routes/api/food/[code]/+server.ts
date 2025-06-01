import { prisma } from '$lib/prisma.js';

export async function GET({ params }) {
	const { code } = params;

	const queryResult = await prisma.nutritionData.findUnique({ where: { code } });

	if (!queryResult) {
		return new Response('Food not found', { status: 404 });
	}

	const result = { ...queryResult, code: queryResult.code.toString() };
	return new Response(JSON.stringify(result), { status: 200 });
}
