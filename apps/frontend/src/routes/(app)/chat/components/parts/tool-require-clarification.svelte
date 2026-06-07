<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Item from '$lib/components/ui/item';
	import type { MyUIMessage } from '@myfit/api';
	import { renderMarkdown } from '../render-markdown';
	import { chat } from '../chat.svelte';

	type RequireClarificationPart = Extract<
		MyUIMessage['parts'][number],
		{ type: 'tool-requireClarification' }
	>;
	const { part }: { part: RequireClarificationPart } = $props();
</script>

{#if part.state !== 'output-error'}
	<Item.Root class="mb-2 w-fit max-w-[80%] place-self-start rounded-tl-none bg-card px-2 py-1">
		<Item.Content class="text-left">
			{#await renderMarkdown(part.input?.message ?? '') then text}
				<article class="prose prose-sm max-w-none dark:prose-invert">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html text}
				</article>
			{/await}
			<div class="mt-2 flex flex-wrap gap-1">
				{#each part.input?.choices ?? [] as choice (choice)}
					<Button
						size="sm"
						class="h-fit w-full py-1 whitespace-break-spaces"
						variant={part.output === choice ? 'default' : 'outline'}
						disabled={part.state !== 'input-available'}
						onclick={() =>
							chat.addToolOutput({
								tool: 'requireClarification',
								toolCallId: part.toolCallId,
								output: choice
							})}
					>
						{choice}
					</Button>
				{/each}
			</div>
		</Item.Content>
	</Item.Root>
{/if}
