export async function GET({ fetch, url }) {
	const query = url.searchParams.get('query');
	if (!query) {
		return new Response('Query parameter is required', { status: 400 });
	}

	const response = await fetch(
		`https://search.openfoodfacts.org/search?q=${encodeURIComponent(query)}&page_size=10&page=1`
	);
	const body = await response.json();

	return new Response(JSON.stringify(body), { status: 200 });
}
