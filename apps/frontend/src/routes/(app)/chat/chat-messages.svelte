<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { BotMessageSquareIcon } from '@lucide/svelte';
	import type { UIMessage } from 'ai';
	import * as Item from '$lib/components/ui/item';
	import { cn } from '$lib/utils';
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';

	interface Props {
		messages: UIMessage[];
	}

	const { messages }: Props = $props();

	async function renderMarkdown(markdownText: string): Promise<string> {
		const rawHtml = await marked.parse(markdownText);
		return DOMPurify.sanitize(rawHtml);
	}
</script>

<ScrollArea class="flex h-px grow flex-col">
	{#each messages as message (message.id)}
		{#each message.parts as part, i (i)}
			{#if part.type === 'file'}
				{#if part.mediaType.startsWith('image/')}
					<img
						src={part.url}
						alt="User provided content"
						class="my-2 ml-auto max-h-20 rounded-md rounded-tr-none"
					/>
				{/if}
			{:else if part.type === 'text'}
				<Item.Root
					class={cn('mb-2 w-fit max-w-[80%] px-2 py-1', {
						'place-self-start rounded-tl-none bg-card': message.role === 'assistant',
						'place-self-end rounded-tr-none bg-primary': message.role === 'user'
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
			{/if}
		{/each}
	{:else}
		<Empty.Root class="h-full">
			<Empty.Header>
				<Empty.Media variant="icon">
					<BotMessageSquareIcon />
				</Empty.Media>
				<Empty.Title>Hey there!</Empty.Title>
				<Empty.Description>How can I assist you today?</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/each}
</ScrollArea>
