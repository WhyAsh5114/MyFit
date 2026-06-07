<script lang="ts">
	import type { MyUIMessage } from '@myfit/api';

	type FilePart = Extract<MyUIMessage['parts'][number], { type: 'file' }>;
	const { part }: { part: FilePart } = $props();
</script>

{#if part.mediaType.startsWith('image/')}
	<img
		src={part.url}
		alt="User provided content"
		class="my-2 ml-auto max-h-20 rounded-md rounded-tr-none"
	/>
{/if}
