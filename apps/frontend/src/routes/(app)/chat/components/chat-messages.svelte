<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { BotMessageSquareIcon } from '@lucide/svelte';
	import * as Item from '$lib/components/ui/item';
	import type { MyUIMessage } from '@myfit/api';
	import { chat } from './chat.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import FilePart from './parts/file.svelte';
	import ReasoningPart from './parts/reasoning.svelte';
	import TextPart from './parts/text.svelte';
	import RequireClarificationPart from './parts/tool-require-clarification.svelte';
	import CreateFoodEntryPart from './parts/tool-create-food-entry.svelte';
	import { type Component } from 'svelte';

	type PartComponent = Component<{ part: MyUIMessage['parts'][number]; role: MyUIMessage['role'] }>;

	const PART_COMPONENTS = {
		file: FilePart,
		reasoning: ReasoningPart,
		text: TextPart,
		'tool-requireClarification': RequireClarificationPart,
		'tool-createFoodEntry': CreateFoodEntryPart
	} as const;

	let viewport = $state<HTMLElement | null>(null);

	$effect(() => {
		void chat.messages;
		void chat.status;
		viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
	});
</script>

<ScrollArea bind:viewportRef={viewport} class="flex h-px grow flex-col pr-2">
	{#each chat.messages as message (message.id)}
		{#each message.parts as part, i (i)}
			{@const Component = PART_COMPONENTS[
				part.type as keyof typeof PART_COMPONENTS
			] as PartComponent}
			{#if Component}
				<Component {part} role={message.role} />
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
		<Item.Root class="mb-2 w-fit max-w-[80%] place-self-start rounded-tl-none bg-card px-2 py-1">
			<Item.Content>
				<Spinner />
			</Item.Content>
		</Item.Root>
	{/if}
</ScrollArea>
