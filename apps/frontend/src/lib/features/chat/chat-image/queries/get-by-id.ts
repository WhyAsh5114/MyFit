import { createQuery } from '@tanstack/svelte-query';
import { apiClient } from '#lib/clients/api-client.js';
import { chatImageKeys } from '../keys';

/**
 * A chat photo from object storage, as a URL an `<img>` can show. The photo is read with the
 * session cookie, which an `<img>` on another origin can't be relied on to send. A photo never
 * changes, so it is read once. `null` when it no longer exists.
 */
export const useChatImageById = (getId: () => string) =>
	createQuery(() => {
		const id = getId();
		return {
			queryKey: chatImageKeys.byId(id),
			queryFn: async () => {
				const res = await apiClient.api.chat.images[':id'].$get({ param: { id } });
				if (res.status === 404) return null;
				if (!res.ok) throw new Error(`Failed to fetch chat image (${res.status})`);
				return URL.createObjectURL(await res.blob());
			},
			staleTime: Infinity,
			gcTime: 1000 * 60 * 60,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			enabled: id.length > 0
		};
	});
