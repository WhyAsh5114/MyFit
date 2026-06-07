import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

export async function renderMarkdown(markdownText: string): Promise<string> {
	const rawHtml = await marked.parse(markdownText);
	return DOMPurify.sanitize(rawHtml);
}
