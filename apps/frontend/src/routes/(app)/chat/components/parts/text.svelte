<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import { cn } from '$lib/utils';
	import type { MyUIMessage } from '@myfit/api';
	import { renderMarkdown } from '../render-markdown';

	type TextPart = Extract<MyUIMessage['parts'][number], { type: 'text' }>;
	const { part, role }: { part: TextPart; role: MyUIMessage['role'] } = $props();
</script>

<Item.Root
	class={cn('mb-2 w-fit max-w-[80%] px-2 py-1', {
		'place-self-start rounded-tl-none bg-card': role === 'assistant',
		'place-self-end rounded-tr-none bg-primary': role === 'user'
	})}
>
	<Item.Content class="text-left">
		{#await renderMarkdown(part.text) then text}
			<article class="prose prose-sm max-w-none dark:prose-invert">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html text}
			</article>
		{/await}
	</Item.Content>
</Item.Root>
