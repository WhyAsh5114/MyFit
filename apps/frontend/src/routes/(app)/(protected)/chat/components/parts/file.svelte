<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import * as Attachment from '#lib/components/ui/attachment/index.js';
	import { FileIcon, ImageOffIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import { CHAT_IMAGE_URL_PREFIX } from '@myfit/shared/constants';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { useChatImageById } from '#lib/features/chat/chat-image/queries/get-by-id.js';

	type FilePart = Extract<MyUIMessage['parts'][number], { type: 'file' }>;
	const { part }: { part: FilePart } = $props();

	/** A photo in object storage is read through the API; an older inline photo is shown as it is. */
	const storedId = $derived(
		part.url.startsWith(CHAT_IMAGE_URL_PREFIX) ? part.url.slice(CHAT_IMAGE_URL_PREFIX.length) : ''
	);
	const stored = useChatImageById(() => storedId);
	const src = $derived(storedId ? stored.data : part.url);
</script>

<Attachment.Root class="self-end">
	{#if part.mediaType.startsWith('image/')}
		<Attachment.Media variant="image" class="size-32 w-32 rounded-xl">
			{#if src}
				<img {src} alt={m['chat.attachedByYou']()} class="size-full object-cover" />
			{:else if stored.isPending}
				<Spinner class="m-auto" />
			{:else}
				<!-- Gone from storage, or unreachable offline. -->
				<ImageOffIcon
					class="m-auto text-muted-foreground"
					aria-label={m['chat.imageUnavailable']()}
				/>
			{/if}
		</Attachment.Media>
	{:else}
		<Attachment.Media>
			<FileIcon />
		</Attachment.Media>
		<Attachment.Content>
			<Attachment.Title>{part.filename ?? 'File'}</Attachment.Title>
		</Attachment.Content>
	{/if}
</Attachment.Root>
