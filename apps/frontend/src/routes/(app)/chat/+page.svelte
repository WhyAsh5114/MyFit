<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { BotMessageSquareIcon, CameraIcon, FileIcon, PlusIcon, SendIcon } from '@lucide/svelte';
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport } from 'ai';
	import { PUBLIC_API_URL } from '$env/static/public';
	import * as Item from '$lib/components/ui/item';
	import { cn } from '$lib/utils';
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';

	const chat = new Chat({
		transport: new DefaultChatTransport({
			api: `${PUBLIC_API_URL}/api/chat`
		})
	});

	let input = $state('');

	const disabled = $derived(chat.status !== 'ready');

	function handleSubmit() {
		chat.sendMessage({
			role: 'user',
			parts: [
				{
					type: 'file' as const,
					mediaType: 'image/png',
					url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzxHrq0pbq0RVIctPeFAlxyEfQqP69y5e0Ys1RTyv29w&s'
				},
				{ type: 'text' as const, text: 'can you estimate calories of this food?' }
			]
		});
		input = '';
	}

	async function renderMarkdown(markdownText: string): Promise<string> {
		const rawHtml = await marked.parse(markdownText);
		return DOMPurify.sanitize(rawHtml);
	}
</script>

<ScrollArea class="flex h-px grow flex-col">
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

<InputGroup.Root>
	<InputGroup.Textarea
		bind:value={input}
		placeholder="Ask, Search or Chat..."
		class="max-h-40"
		onkeydown={(event) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				handleSubmit();
			}
		}}
	/>
	<InputGroup.Addon align="block-end">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<InputGroup.Button variant="outline" class="rounded-full" size="icon-sm" {...props}>
						<PlusIcon />
					</InputGroup.Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start">
				<DropdownMenu.Group>
					<DropdownMenu.Item><CameraIcon /> Camera</DropdownMenu.Item>
					<DropdownMenu.Item><FileIcon /> File</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<InputGroup.Button
			variant="default"
			size="sm"
			class="ml-auto"
			onclick={handleSubmit}
			{disabled}
		>
			Send
			<SendIcon />
		</InputGroup.Button>
	</InputGroup.Addon>
</InputGroup.Root>
