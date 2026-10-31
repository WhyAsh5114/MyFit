<script lang="ts">
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import type { MyUIMessage } from '@myfit/api';
	import Markdown from '../markdown.svelte';

	type TextPart = Extract<MyUIMessage['parts'][number], { type: 'text' }>;
	const { part, role }: { part: TextPart; role: MyUIMessage['role'] } = $props();
</script>

{#if role === 'user'}
	<Bubble.Root align="end">
		<Bubble.Content class="whitespace-pre-wrap">{part.text}</Bubble.Content>
	</Bubble.Root>
{:else}
	<Bubble.Root variant="ghost">
		<Bubble.Content>
			<Markdown text={part.text} />
		</Bubble.Content>
	</Bubble.Root>
{/if}
