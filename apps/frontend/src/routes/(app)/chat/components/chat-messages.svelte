<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { BotMessageSquareIcon } from '@lucide/svelte';
	import * as Item from '$lib/components/ui/item';
	import { cn } from '$lib/utils';
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';
	import Button from '$lib/components/ui/button/button.svelte';
	import { chat } from './chat.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';

	async function renderMarkdown(markdownText: string): Promise<string> {
		const rawHtml = await marked.parse(markdownText);
		return DOMPurify.sanitize(rawHtml);
	}
</script>

<ScrollArea class="flex h-px grow flex-col pr-2">
	{#each chat.messages as message (message.id)}
		{#each message.parts as part, i (i)}
			{#if part.type === 'file'}
				{#if part.mediaType.startsWith('image/')}
					<img
						src={part.url}
						alt="User provided content"
						class="my-2 ml-auto max-h-20 rounded-md rounded-tr-none"
					/>
				{/if}
			{:else if part.type === 'reasoning'}
				<Accordion.Root
					type="single"
					class="mb-2 max-w-[80%] rounded-md rounded-tl-none border px-2"
				>
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
			{:else if part.type === 'tool-requireClarification' && part.state !== 'output-error'}
				<Item.Root
					class="mb-2 w-fit max-w-[80%] place-self-start rounded-tl-none bg-card px-2 py-1"
				>
					<Item.Content class="text-left">
						{#await renderMarkdown(part.input?.message ?? '') then text}
							<article class="prose prose-sm max-w-none dark:prose-invert">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html text}
							</article>
						{/await}
						<!-- {#if part.state === 'input-available'} -->
						<div class="mt-2 flex flex-wrap gap-1">
							{#each part.input?.choices as choice (choice)}
								<Button
									size="sm"
									class="h-fit w-full py-1 whitespace-break-spaces"
									variant={part.output === choice ? 'default' : 'outline'}
									disabled={part.state !== 'input-available'}
									onclick={() =>
										chat.addToolOutput({
											tool: 'requireClarification',
											toolCallId: part.toolCallId,
											output: choice!
										})}
								>
									{choice}
								</Button>
							{/each}
						</div>
						<!-- {:else if part.state === 'output-available'}
							<div class="mt-2 flex flex-wrap gap-1">
								{#each part.input?.choices as choice (choice)}
									<Button size="sm" class="w-full" variant="outline">
										{choice}
									</Button>
								{/each}
							</div>
							<Button size="sm" class="mt-2 w-full">
								{part.output}
							</Button>
						{/if} -->
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
	{#if chat.status === 'submitted'}
		<Item.Root
			class={cn('mb-2 w-fit max-w-[80%] place-self-start rounded-tl-none bg-card px-2 py-1')}
		>
			<Item.Content>
				<Spinner />
			</Item.Content>
		</Item.Root>
	{/if}
</ScrollArea>
