<script lang="ts">
	import * as Collapsible from '#lib/components/ui/collapsible/index.js';
	import { ChevronDownIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import { untrack } from 'svelte';
	import Markdown from '../markdown.svelte';

	type ReasoningPart = Extract<MyUIMessage['parts'][number], { type: 'reasoning' }>;
	const { part }: { part: ReasoningPart } = $props();

	const streaming = $derived(part.state === 'streaming');

	// Always starts folded, so thinking never pushes the reply around. The seconds are only
	// known for thinking this tab watched, so reasoning that arrives finished has no duration.
	const wasStreaming = untrack(() => part.state === 'streaming');
	const startedAt = wasStreaming ? Date.now() : null;
	let open = $state(false);
	let seconds = $state<number | null>(null);

	$effect(() => {
		if (streaming || startedAt === null || seconds !== null) return;
		seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
	});
</script>

<Collapsible.Root bind:open class="w-full">
	<Collapsible.Trigger
		class="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		{#if streaming}
			<span class="animate-pulse">Thinking...</span>
		{:else if seconds !== null}
			Thought for {seconds}s
		{:else}
			Thought process
		{/if}
		<ChevronDownIcon class="size-4 transition-transform group-data-[state=open]:rotate-180" />
	</Collapsible.Trigger>
	<Collapsible.Content>
		<div class="mt-2 ml-1 border-l pl-4">
			<Markdown text={part.text} muted />
		</div>
	</Collapsible.Content>
</Collapsible.Root>
