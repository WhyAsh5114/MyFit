<script lang="ts">
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { useCreateFoodEntry } from '#lib/features/food-diary/food-entry/mutations/create.js';
	import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
	import { useCurrentUser } from '#lib/features/user/queries/get-current-user.js';
	import { CheckIcon, XIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import MacrosPieChart from '../../../food-diary/[date]/components/add-edit-entries/macros-pie-chart.svelte';
	import { chat } from '../chat.svelte';

	type CreateFoodEntryPart = Extract<
		MyUIMessage['parts'][number],
		{ type: 'tool-createFoodEntry' }
	>;
	const { part, active }: { part: CreateFoodEntryPart; active: boolean } = $props();

	/** Still waiting on a choice, but the user has typed something else instead. */
	const skipped = $derived(part.state === 'input-available' && !active);

	const createFoodEntry = useCreateFoodEntry();
	const currentUser = useCurrentUser();

	/** A nutrient for the whole portion, from its per-100g value. */
	const portion = (per100g: number | undefined) =>
		((per100g ?? 0) / 100) * (part.input?.quantityG ?? 0);
	const grams = (per100g: number | undefined) => `${Math.round(portion(per100g) * 10) / 10}g`;

	const kcal = $derived(portion(part.input?.energyKcal_100g));
	const protein = $derived(portion(part.input?.proteinsG_100g));
	const carbs = $derived(portion(part.input?.carbohydratesG_100g));
	const fat = $derived(portion(part.input?.fatG_100g));

	async function log() {
		if (!currentUser.data?.id || !part.input) return;

		const { name, ...rest } = part.input;
		const data = {
			...rest,
			productName: name,
			brands: null,
			eatenAt: new Date(),
			servingSize: null,
			servingQuantity: null,
			preferredUnit: 'g' as const,
			mealId: null
		} as FoodEntryFormSchema;

		try {
			await createFoodEntry.mutateAsync({ data, userId: currentUser.data.id });
			chat.addToolOutput({
				tool: 'createFoodEntry',
				toolCallId: part.toolCallId,
				output: 'created'
			});
		} catch {
			// The mutation already showed a toast, and the card stays open so the user can retry.
		}
	}

	function cancel() {
		chat.addToolOutput({
			tool: 'createFoodEntry',
			toolCallId: part.toolCallId,
			output: 'cancelled by user'
		});
	}
</script>

{#if part.state === 'input-streaming'}
	<Bubble.Root variant="ghost">
		<Bubble.Content class="flex items-center gap-2 text-muted-foreground">
			<Spinner /> Estimating nutrition...
		</Bubble.Content>
	</Bubble.Root>
{:else if part.state === 'input-available' || part.state === 'output-available'}
	<Card.Root size="sm" class="w-full max-w-sm shadow-sm">
		<Card.Header>
			<Card.Title>{part.input.name}</Card.Title>
			<Card.Description>{part.input.quantityG}g · {Math.round(kcal)} kcal</Card.Description>
			{#if part.state === 'output-available' || skipped}
				<Card.Action>
					{#if part.state === 'output-available' && part.output === 'created'}
						<Badge variant="secondary"><CheckIcon /> Logged</Badge>
					{:else if skipped}
						<Badge variant="outline"><XIcon /> Skipped</Badge>
					{:else}
						<Badge variant="outline"><XIcon /> Cancelled</Badge>
					{/if}
				</Card.Action>
			{/if}
		</Card.Header>
		<Card.Content class="flex items-center gap-4">
			<MacrosPieChart {kcal} {protein} {carbs} {fat} />
			<dl class="grid flex-1 grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 text-sm">
				<dt class="text-muted-foreground">Protein</dt>
				<dd class="text-right">{grams(part.input.proteinsG_100g)}</dd>
				<dt class="text-muted-foreground">Carbs</dt>
				<dd class="text-right">{grams(part.input.carbohydratesG_100g)}</dd>
				<dt class="text-muted-foreground">Fat</dt>
				<dd class="text-right">{grams(part.input.fatG_100g)}</dd>
			</dl>
		</Card.Content>
		{#if part.state === 'input-available' && !skipped}
			<Card.Footer class="grid grid-cols-2 gap-2">
				<Button variant="outline" disabled={createFoodEntry.isPending} onclick={cancel}>
					Cancel
				</Button>
				<Button disabled={createFoodEntry.isPending} onclick={log}>
					{#if createFoodEntry.isPending}<Spinner />{:else}Log{/if}
				</Button>
			</Card.Footer>
		{/if}
	</Card.Root>
{:else if part.state === 'output-error'}
	<Bubble.Root variant="destructive">
		<Bubble.Content>Failed to create the food entry.</Bubble.Content>
	</Bubble.Root>
{/if}
