import { PUBLIC_API_URL } from '$app/env/public';
import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import z from 'zod';
import { chatImageKeys } from '../keys.js';

const uploadResponse = z.object({ id: z.string() });

/**
 * Stores a photo in object storage and answers its id. A network request, so it keeps TanStack's
 * retry. The photo is cached under its id, so the message shows it without downloading it again.
 * The body is the raw image, which the RPC client can't send, so this uses `fetch`.
 */
export const useUploadChatImage = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: async (image: Blob) => {
			const res = await fetch(`${PUBLIC_API_URL}/api/chat/images`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'content-type': image.type },
				body: image
			});
			if (!res.ok) throw new Error(`Failed to upload chat image (${res.status})`);
			const { id } = uploadResponse.parse(await res.json());
			return { id, image };
		},
		retry: 2,
		onSuccess: ({ id, image }) => {
			queryClient.setQueryData(chatImageKeys.byId(id), URL.createObjectURL(image));
		}
	}));
};
