<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { useDeleteFoodEntries } from '#lib/features/food-diary/food-entry/mutations/delete-many.js';
	import { CheckIcon, SearchXIcon, Trash2Icon, XIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import { getChatPageContext } from '../chat.svelte';
	import { findEntriesToDelete, summarize } from '../tools/delete-food-entries';
	import { parseLocalDateTime, whenLabel } from '../tools/local-time';

	type DeleteFoodEntriesPart = Extract<
		MyUIMessage['parts'][number],
		{ type: 'tool-deleteFoodEntries' }
	>;
	const { part, active }: { part: DeleteFoodEntriesPart; active: boolean } = $props();

	const context = getChatPageContext();
	const deleteFoodEntries = useDeleteFoodEntries();

	/** Still waiting on a choice, but the user has typed something else instead. */
	const skipped = $derived(part.state === 'input-available' && !active);

	/** The entries as they are on this device, read once the model has named them. */
	const lookup = $derived(
		part.state === 'input-available'
			? findEntriesToDelete(context.session.userId, part.input.ids)
			: null
	);

	async function confirm(found: Awaited<ReturnType<typeof findEntriesToDelete>>) {
		let deleted;
		try {
			deleted = await deleteFoodEntries.mutateAsync({
				userId: context.session.userId,
				ids: found.entries.map((entry) => entry.id)
			});
		} catch {
			return; // The mutation showed a toast, and the card stays open for another try.
		}
		const ids = new Set(deleted.map((entry) => entry.id));
		await context.session.answer({
			tool: 'deleteFoodEntries',
			toolCallId: part.toolCallId,
			output: {
				deleted: found.entries.filter((entry) => ids.has(entry.id)).map(summarize),
				cancelled: false,
				// Including any another write removed while the card was open.
				notFound: [
					...found.notFound,
					...found.entries.filter((e) => !ids.has(e.id)).map((e) => e.id)
				]
			}
		});
	}

	function cancel() {
		void context.session.answer({
			tool: 'deleteFoodEntries',
			toolCallId: part.toolCallId,
			output: { deleted: [], cancelled: true, notFound: [] }
		});
	}
</script>

{#snippet finding()}
	<p role="status" class="flex items-center gap-2 text-sm text-muted-foreground">
		<Spinner />
		{m['chat.findingEntries']()}
	</p>
{/snippet}

{#if part.state === 'input-streaming'}
	{@render finding()}
{:else if part.state === 'input-available' && lookup}
	{#await lookup}
		{@render finding()}
	{:then found}
		{#if found.entries.length > 0}
			<Card.Root size="sm" class="w-full max-w-sm shadow-sm">
				<Card.Header>
					<Card.Title>{m['chat.deleteEntriesTitle']()}</Card.Title>
					<Card.Description>{m['chat.deleteEntriesHint']()}</Card.Description>
					{#if skipped}
						<Card.Action>
							<Badge variant="outline"><XIcon /> {m['chat.skipped']()}</Badge>
						</Card.Action>
					{/if}
				</Card.Header>
				<Card.Content>
					<Table.Root class="text-xs">
						<Table.Body>
							{#each found.entries as entry (entry.id)}
								<Table.Row>
									<Table.Cell class="max-w-32 truncate py-1.5 font-medium">
										{entry.name}
										{#if entry.meal}
											<span class="block font-normal text-muted-foreground">{entry.meal}</span>
										{/if}
									</Table.Cell>
									<Table.Cell class="py-1.5 text-end tabular-nums">
										{Math.round(entry.quantityG)} g
										<span class="block text-muted-foreground">{entry.kcal} kcal</span>
									</Table.Cell>
									<Table.Cell class="py-1.5 text-end text-muted-foreground">
										{whenLabel(entry.eatenAt)}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
				{#if !skipped}
					<Card.Footer class="grid grid-cols-2 gap-2">
						<Button variant="outline" disabled={deleteFoodEntries.isPending} onclick={cancel}>
							{m['common.cancel']()}
						</Button>
						<Button
							variant="destructive"
							disabled={deleteFoodEntries.isPending}
							onclick={() => confirm(found)}
						>
							{#if deleteFoodEntries.isPending}
								<Spinner />
							{:else}
								<Trash2Icon />
								{m['chat.deleteEntries']({ count: found.entries.length })}
							{/if}
						</Button>
					</Card.Footer>
				{/if}
			</Card.Root>
		{/if}
		<!-- With nothing found, the app answers the model by itself and the output shows instead. -->
	{:catch}
		<Bubble.Root variant="destructive">
			<Bubble.Content>{m['chat.deleteEntriesFailed']()}</Bubble.Content>
		</Bubble.Root>
	{/await}
{:else if part.state === 'output-available'}
	{#if part.output.deleted.length > 0}
		<Card.Root size="sm" class="w-full max-w-sm shadow-sm">
			<Card.Header>
				<Card.Title>{m['chat.deleteEntriesTitle']()}</Card.Title>
				<Card.Action>
					<Badge variant="secondary"><CheckIcon /> {m['chat.entriesDeleted']()}</Badge>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<Table.Root class="text-xs">
					<Table.Body>
						{#each part.output.deleted as entry, index (index)}
							{@const eatenAt = parseLocalDateTime(`${entry.date}T${entry.time}`)}
							<Table.Row class="text-muted-foreground line-through">
								<Table.Cell class="max-w-32 truncate py-1.5">{entry.name}</Table.Cell>
								<Table.Cell class="py-1.5 text-end tabular-nums">
									{Math.round(entry.quantityG)} g
								</Table.Cell>
								<Table.Cell class="py-1.5 text-end">{eatenAt && whenLabel(eatenAt)}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{:else if part.output.cancelled}
		<p class="flex items-center gap-2 text-sm text-muted-foreground">
			<XIcon class="size-4" />
			{m['chat.deleteEntriesCancelled']()}
		</p>
	{:else}
		<p role="status" class="flex items-center gap-2 text-sm text-muted-foreground">
			<SearchXIcon class="size-4" />
			{m['chat.noEntriesFound']()}
		</p>
	{/if}
{:else if part.state === 'output-error'}
	<Bubble.Root variant="destructive">
		<Bubble.Content>{m['chat.deleteEntriesFailed']()}</Bubble.Content>
	</Bubble.Root>
{/if}
