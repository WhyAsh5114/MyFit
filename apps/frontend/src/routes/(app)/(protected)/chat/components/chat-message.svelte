<script lang="ts">
	import * as Message from '#lib/components/ui/message/index.js';
	import type { MyUIMessage } from '@myfit/api';
	import FilePart from './parts/file.svelte';
	import ReasoningPart from './parts/reasoning.svelte';
	import TextPart from './parts/text.svelte';
	import CreateFoodEntryPart from './parts/tool-create-food-entry.svelte';
	import RequireClarificationPart from './parts/tool-require-clarification.svelte';

	type Part = MyUIMessage['parts'][number];
	type PartOf<T extends Part['type']> = Extract<Part, { type: T }>;

	let { message, active }: { message: MyUIMessage; active: boolean } = $props();

	const isUser = $derived(message.role === 'user');
</script>

<Message.Root align={isUser ? 'end' : 'start'}>
	<Message.Content>
		{#each message.parts as part, index (index)}
			{#if part.type === 'text'}
				<TextPart part={part as PartOf<'text'>} role={message.role} />
			{:else if part.type === 'file'}
				<FilePart part={part as PartOf<'file'>} />
			{:else if part.type === 'reasoning'}
				<ReasoningPart part={part as PartOf<'reasoning'>} />
			{:else if part.type === 'tool-requireClarification'}
				<RequireClarificationPart part={part as PartOf<'tool-requireClarification'>} {active} />
			{:else if part.type === 'tool-createFoodEntry'}
				<CreateFoodEntryPart part={part as PartOf<'tool-createFoodEntry'>} {active} />
			{/if}
		{/each}
	</Message.Content>
</Message.Root>
