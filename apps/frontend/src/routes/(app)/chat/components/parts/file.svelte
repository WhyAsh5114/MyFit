<script lang="ts">
	import * as Attachment from '#lib/components/ui/attachment/index.js';
	import { FileIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';

	type FilePart = Extract<MyUIMessage['parts'][number], { type: 'file' }>;
	const { part }: { part: FilePart } = $props();
</script>

<Attachment.Root class="self-end">
	{#if part.mediaType.startsWith('image/')}
		<Attachment.Media variant="image" class="size-32 w-32 rounded-xl">
			<img src={part.url} alt="Attached by you" class="size-full object-cover" />
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
