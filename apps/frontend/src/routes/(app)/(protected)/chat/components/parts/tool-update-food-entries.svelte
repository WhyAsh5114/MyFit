<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { useUpdateFoodEntries } from '#lib/features/food-diary/food-entry/mutations/update-many.js';
	import { OPTIONAL_NUTRIENT_FIELDS } from '@myfit/shared/nutrition';
	import { CheckIcon, PencilIcon, SearchXIcon, XIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import { getChatPageContext } from '../chat.svelte';
	import { parseLocalDateTime, whenLabel } from '../tools/local-time';
	import { planUpdates, summarizeUpdate, type PlannedUpdate } from '../tools/update-food-entries';

	type UpdateFoodEntriesPart = Extract<
		MyUIMessage['parts'][number],
		{ type: 'tool-updateFoodEntries' }
	>;
	const { part, active }: { part: UpdateFoodEntriesPart; active: boolean } = $props();

	const context = getChatPageContext();
	const updateFoodEntries = useUpdateFoodEntries();

	/** Still waiting on a choice, but the user has typed something else instead. */
	const skipped = $derived(part.state === 'input-available' && !active);

	/** The edits against the entries on this device, read once the model has named them. */
	const plan = $derived(
		part.state === 'input-available'
			? planUpdates(context.session.userId, part.input.edits, context.meals)
			: null
	);

	async function confirm(planned: Awaited<ReturnType<typeof planUpdates>>) {
		const changing = planned.updates.filter((u) => Object.keys(u.changes).length > 0);
		let updated;
		try {
			updated = await updateFoodEntries.mutateAsync({
				userId: context.session.userId,
				changes: changing.map((u) => ({ id: u.id, data: u.changes }))
			});
		} catch {
			return; // The mutation showed a toast, and the card stays open for another try.
		}
		const ids = new Set(updated.map((entry) => entry.id));
		await context.session.answer({
			tool: 'updateFoodEntries',
			toolCallId: part.toolCallId,
			output: {
				// Entries the edit left as they were count as updated: they are what the user wanted.
				updated: planned.updates
					.filter((u) => ids.has(u.id) || !changing.includes(u))
					.map(summarizeUpdate),
				cancelled: false,
				// Including any another write removed while the card was open.
				notFound: [...planned.notFound, ...changing.filter((u) => !ids.has(u.id)).map((u) => u.id)]
			}
		});
	}

	function cancel() {
		void context.session.answer({
			tool: 'updateFoodEntries',
			toolCallId: part.toolCallId,
			output: { updated: [], cancelled: true, notFound: [] }
		});
	}

	type Change = { label: string; before: string; after: string };

	/** The values an edit changes, one row each, so an unchanged value never hides the change. */
	function changesOf({ before, after, changes }: PlannedUpdate): Change[] {
		const rows: (Change | false)[] = [
			before.name !== after.name && {
				label: m['chat.fieldName'](),
				before: before.name,
				after: after.name
			},
			before.quantityG !== after.quantityG && {
				label: m['foodDiary.entryQuantity'](),
				before: `${Math.round(before.quantityG * 10) / 10} g`,
				after: `${Math.round(after.quantityG * 10) / 10} g`
			},
			before.kcal !== after.kcal && {
				label: m['chat.fieldCalories'](),
				before: `${before.kcal} kcal`,
				after: `${after.kcal} kcal`
			},
			before.eatenAt.getTime() !== after.eatenAt.getTime() && {
				label: m['chat.fieldTime'](),
				before: whenLabel(before.eatenAt),
				after: whenLabel(after.eatenAt)
			},
			...(
				[
					['chat.fieldCarbs', 'carbsG'],
					['chat.fieldFat', 'fatG'],
					['chat.fieldProtein', 'proteinG']
				] as const
			).map(
				([key, field]) =>
					before[field] !== after[field] && {
						label: m[key](),
						before: `${before[field]} g`,
						after: `${after[field]} g`
					}
			),
			...OPTIONAL_NUTRIENT_FIELDS.map(({ key, label, unit }) => {
				const [was, now] = [before.extras[key], after.extras[key]];
				const show = (value: number | null) =>
					value === null ? '—' : `${Math.round(value * 1000) / 1000} ${unit}`;
				return was !== now && { label, before: show(was), after: show(now) };
			}),
			'mealId' in changes && {
				label: m['foodDiary.entryMeal'](),
				before: before.meal ?? m['chat.noMeal'](),
				after: after.meal ?? m['chat.noMeal']()
			}
		];
		return rows.filter((row) => row !== false);
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
{:else if part.state === 'input-available' && plan}
	{#await plan}
		{@render finding()}
	{:then planned}
		{#if planned.updates.length > 0}
			<Card.Root size="sm" class="w-full max-w-sm shadow-sm">
				<Card.Header>
					<Card.Title>{m['chat.updateEntriesTitle']()}</Card.Title>
					<Card.Description>{m['chat.updateEntriesHint']()}</Card.Description>
					{#if skipped}
						<Card.Action>
							<Badge variant="outline"><XIcon /> {m['chat.skipped']()}</Badge>
						</Card.Action>
					{/if}
				</Card.Header>
				<Card.Content>
					<Table.Root class="text-xs">
						{#each planned.updates as update (update.id)}
							{@const rows = changesOf(update)}
							<Table.Header>
								<Table.Row>
									<Table.Head colspan={3} class="h-8 truncate font-medium text-foreground">
										{update.before.name}
									</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each rows as row (row.label)}
									<Table.Row>
										<Table.Cell class="py-1 text-muted-foreground">{row.label}</Table.Cell>
										<Table.Cell class="py-1 text-muted-foreground tabular-nums line-through">
											{row.before}
										</Table.Cell>
										<Table.Cell class="py-1 font-medium tabular-nums">{row.after}</Table.Cell>
									</Table.Row>
								{:else}
									<Table.Row>
										<Table.Cell colspan={3} class="py-1 text-muted-foreground">
											{m['chat.noChanges']()}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						{/each}
					</Table.Root>
				</Card.Content>
				{#if !skipped}
					<Card.Footer class="grid grid-cols-2 gap-2">
						<Button variant="outline" disabled={updateFoodEntries.isPending} onclick={cancel}>
							{m['common.cancel']()}
						</Button>
						<Button disabled={updateFoodEntries.isPending} onclick={() => confirm(planned)}>
							{#if updateFoodEntries.isPending}
								<Spinner />
							{:else}
								<PencilIcon />
								{m['chat.updateEntries']({ count: planned.updates.length })}
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
	{#if part.output.updated.length > 0}
		<Card.Root size="sm" class="w-full max-w-sm shadow-sm">
			<Card.Header>
				<Card.Title>{m['chat.updateEntriesTitle']()}</Card.Title>
				<Card.Action>
					<Badge variant="secondary"><CheckIcon /> {m['chat.entriesUpdated']()}</Badge>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<Table.Root class="text-xs">
					<Table.Body>
						{#each part.output.updated as entry, index (index)}
							{@const eatenAt = parseLocalDateTime(`${entry.date}T${entry.time}`)}
							<Table.Row>
								<Table.Cell class="max-w-32 truncate py-1.5 font-medium">
									{entry.name}
									{#if entry.meal}
										<span class="block font-normal text-muted-foreground">{entry.meal}</span>
									{/if}
								</Table.Cell>
								<Table.Cell class="py-1.5 text-end tabular-nums">
									{Math.round(entry.quantityG)} g
								</Table.Cell>
								<Table.Cell class="py-1.5 text-end text-muted-foreground">
									{eatenAt && whenLabel(eatenAt)}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{:else if part.output.cancelled}
		<p class="flex items-center gap-2 text-sm text-muted-foreground">
			<XIcon class="size-4" />
			{m['chat.updateEntriesCancelled']()}
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
