<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import type { MyUIMessage } from '@myfit/api';
	import { renderMarkdown } from '../render-markdown';

	type ReasoningPart = Extract<MyUIMessage['parts'][number], { type: 'reasoning' }>;
	const { part }: { part: ReasoningPart } = $props();
</script>

<Accordion.Root type="single" class="mb-2 max-w-[80%] rounded-md rounded-tl-none border px-2">
	<Accordion.Item value="item-1">
		<Accordion.Trigger class="py-1 font-normal text-muted-foreground">
			{#if part.state === 'streaming'}
				<p class="animate-pulse">Thinking...</p>
			{:else if part.state === 'done'}
				Thought process
			{/if}
		</Accordion.Trigger>
		<Accordion.Content>
			{#await renderMarkdown(part.text) then text}
				<article class="prose prose-sm max-w-none dark:prose-invert">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html text}
				</article>
			{/await}
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
