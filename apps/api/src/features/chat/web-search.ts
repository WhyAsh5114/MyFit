import { env } from '../../../lib/env.js';

const EXA_SEARCH_URL = 'https://api.exa.ai/search';
const MAX_RESULTS = 5;
/** Enough of a page for a nutrition label, small enough that five pages stay cheap. */
const MAX_CHARACTERS = 2_000;
const TIMEOUT_MS = 15_000;

type ExaResponse = { results?: { title?: string | null; url: string; text?: string | null }[] };

/**
 * Searches the web through Exa and answers each page with an excerpt of its text. Throws when
 * search is not configured or fails, which the model sees as a tool error and can work around.
 */
export async function searchWeb(query: string) {
	if (!env.EXA_API_KEY) throw new Error('Web search is not available.');

	const response = await fetch(EXA_SEARCH_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'x-api-key': env.EXA_API_KEY },
		body: JSON.stringify({
			query,
			type: 'auto',
			numResults: MAX_RESULTS,
			contents: { text: { maxCharacters: MAX_CHARACTERS } }
		}),
		signal: AbortSignal.timeout(TIMEOUT_MS)
	});
	if (!response.ok) {
		console.warn('Exa search failed', response.status, await response.text().catch(() => ''));
		throw new Error('Web search failed.');
	}

	const { results = [] } = (await response.json()) as ExaResponse;
	return {
		results: results.map((result) => ({
			title: result.title ?? result.url,
			url: result.url,
			text: result.text ?? ''
		}))
	};
}
