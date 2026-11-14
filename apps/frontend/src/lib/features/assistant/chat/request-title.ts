import { apiClient } from '#lib/clients/api-client.js';

/**
 * Asks the server to name a chat from its first message. `null` when the server gives no title;
 * throws when the request fails, so the caller can keep the default title.
 */
export async function requestChatTitle(text: string): Promise<string | null> {
	const response = await apiClient.api.chat.title.$post({ json: { text } });
	if (!response.ok) return null;
	const { title } = await response.json();
	return title || null;
}
