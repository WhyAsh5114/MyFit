<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Questionnaire from '#lib/components/ui/questionnaire/index.js';
	import { XIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import { chat } from '../chat.svelte';

	type RequireClarificationPart = Extract<
		MyUIMessage['parts'][number],
		{ type: 'tool-requireClarification' }
	>;
	const { part, active }: { part: RequireClarificationPart; active: boolean } = $props();

	const choices = $derived(
		(part.input?.choices ?? []).filter((choice): choice is string => choice !== undefined)
	);

	function answer(event: SubmitEvent) {
		event.preventDefault();
		const values = new FormData(event.currentTarget as HTMLFormElement)
			.getAll('answer')
			.filter((value): value is string => typeof value === 'string' && value.trim() !== '');
		const output = values.at(-1)?.trim();
		if (!output) return;
		chat.addToolOutput({ tool: 'requireClarification', toolCallId: part.toolCallId, output });
	}
</script>

{#if part.state === 'input-available' && active}
	<Card.Root size="sm" class="w-full max-w-xs shadow-sm">
		<Card.Content>
			<Questionnaire.Root
				items={[{ name: 'answer', required: true, choices: choices.map((value) => ({ value })) }]}
				onSubmit={answer}
				class="gap-2"
			>
				<Questionnaire.Item name="answer" required class="gap-2">
					<Questionnaire.Title class="text-sm">{part.input.message}</Questionnaire.Title>
					<Questionnaire.Choices class="gap-1.5">
						{#each choices as choice (choice)}
							<Questionnaire.Choice value={choice} class="min-h-0 gap-2 px-3 py-1.5 sm:min-h-0">
								{choice}
							</Questionnaire.Choice>
						{/each}
						<Questionnaire.Input
							aria-label="Something else"
							placeholder="Something else..."
							class="min-h-0 text-sm"
						/>
					</Questionnaire.Choices>
				</Questionnaire.Item>
				<Questionnaire.Actions>
					<Questionnaire.Submit size="sm" class="min-h-0">Send</Questionnaire.Submit>
				</Questionnaire.Actions>
			</Questionnaire.Root>
		</Card.Content>
	</Card.Root>
{:else if part.state === 'input-available'}
	<!-- The user typed something else instead, so the question is closed. -->
	<Bubble.Root variant="ghost">
		<Bubble.Content>{part.input.message}</Bubble.Content>
	</Bubble.Root>
	<Badge variant="outline" class="w-fit"><XIcon /> Skipped</Badge>
{:else if part.state === 'output-available'}
	<!-- Answered: the question stays as context and the answer reads as the user's reply. -->
	<Bubble.Root variant="ghost">
		<Bubble.Content>{part.input.message}</Bubble.Content>
	</Bubble.Root>
	<Bubble.Root align="end">
		<Bubble.Content>{part.output}</Bubble.Content>
	</Bubble.Root>
{/if}
