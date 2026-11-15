<script lang="ts">
	import * as Message from '#lib/components/ui/message/index.js';
	import type { MyUIMessage } from '@myfit/api';
	import FilePart from './parts/file.svelte';
	import ReasoningPart from './parts/reasoning.svelte';
	import TextPart from './parts/text.svelte';
	import CreateFoodEntryPart from './parts/tool-create-food-entry.svelte';
	import DeleteFoodEntriesPart from './parts/tool-delete-food-entries.svelte';
	import UpdateFoodEntriesPart from './parts/tool-update-food-entries.svelte';
	import ReadFoodEntriesPart from './parts/tool-read-food-entries.svelte';
	import RequireClarificationPart from './parts/tool-require-clarification.svelte';
	import SearchFoodsPart from './parts/tool-search-foods.svelte';
	import WebSearchPart from './parts/tool-web-search.svelte';

	let { message, active }: { message: MyUIMessage; active: boolean } = $props();

	const isUser = $derived(message.role === 'user');
</script>

<Message.Root align={isUser ? 'end' : 'start'}>
	<Message.Content>
		{#each message.parts as part, index (index)}
			{#if part.type === 'text'}
				<TextPart {part} role={message.role} />
			{:else if part.type === 'file'}
				<FilePart {part} />
			{:else if part.type === 'reasoning'}
				<ReasoningPart {part} />
			{:else if part.type === 'tool-requireClarification'}
				<RequireClarificationPart {part} {active} />
			{:else if part.type === 'tool-createFoodEntry'}
				<CreateFoodEntryPart {part} {active} />
			{:else if part.type === 'tool-readFoodEntries'}
				<ReadFoodEntriesPart {part} />
			{:else if part.type === 'tool-deleteFoodEntries'}
				<DeleteFoodEntriesPart {part} {active} />
			{:else if part.type === 'tool-updateFoodEntries'}
				<UpdateFoodEntriesPart {part} {active} />
			{:else if part.type === 'tool-searchFoods'}
				<SearchFoodsPart {part} />
			{:else if part.type === 'tool-webSearch'}
				<WebSearchPart {part} />
			{/if}
		{/each}
	</Message.Content>
</Message.Root>
