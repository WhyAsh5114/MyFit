import { prisma } from '$lib/prisma.js';

export async function GET({ url }) {
	const query = url.searchParams.get('query');
	if (!query) {
		return new Response('Query parameter is required', { status: 400 });
	}

	const results = (
		await prisma.nutritionData.findMany({
			where: {
				OR: [
					{ product_name: { contains: query, mode: 'insensitive' } },
					{ brands: { contains: query, mode: 'insensitive' } }
				]
			},
			take: 10
		})
	).map((result) => ({ ...result, code: result.code.toString() }));

	return new Response(JSON.stringify(results), { status: 200 });
}
