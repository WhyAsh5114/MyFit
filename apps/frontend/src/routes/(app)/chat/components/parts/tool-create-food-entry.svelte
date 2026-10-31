<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { useCreateFoodEntry } from '#lib/features/food-diary/food-entry/mutations/create.js';
	import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
	import { getCurrentUser } from '#lib/features/user/current-user.svelte.js';
	import { CheckIcon, XIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import FoodCard from '../../../food-diary/[date]/components/add-edit-entries/food-card.svelte';
	import { chat } from '../chat.svelte';

	type CreateFoodEntryPart = Extract<
		MyUIMessage['parts'][number],
		{ type: 'tool-createFoodEntry' }
	>;
	const { part, active }: { part: CreateFoodEntryPart; active: boolean } = $props();

	/** Still waiting on a choice, but the user has typed something else instead. */
	const skipped = $derived(part.state === 'input-available' && !active);

	const createFoodEntry = useCreateFoodEntry();
	const currentUser = $derived(getCurrentUser());

	async function log() {
		if (!currentUser || !part.input) return;

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
			await createFoodEntry.mutateAsync({ data, userId: currentUser.id });
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
			<Spinner />
			{m['chat.estimating']()}
		</Bubble.Content>
	</Bubble.Root>
{:else if part.state === 'input-available' || part.state === 'output-available'}
	<Card.Root size="sm" class="w-full max-w-sm shadow-sm">
		<Card.Header>
			<Card.Title>{part.input.name}</Card.Title>
			<Card.Description>{part.input.quantityG} g</Card.Description>
			{#if part.state === 'output-available' || skipped}
				<Card.Action>
					{#if part.state === 'output-available' && part.output === 'created'}
						<Badge variant="secondary"><CheckIcon /> {m['chat.logged']()}</Badge>
					{:else if skipped}
						<Badge variant="outline"><XIcon /> {m['chat.skipped']()}</Badge>
					{:else}
						<Badge variant="outline"><XIcon /> {m['chat.cancelled']()}</Badge>
					{/if}
				</Card.Action>
			{/if}
		</Card.Header>
		<FoodCard
			food={{
				productName: part.input.name,
				brands: null,
				energyKcal_100g: part.input.energyKcal_100g,
				carbohydratesG_100g: part.input.carbohydratesG_100g,
				fatG_100g: part.input.fatG_100g,
				proteinsG_100g: part.input.proteinsG_100g
			}}
			quantityG={part.input.quantityG}
		/>
		{#if part.state === 'input-available' && !skipped}
			<Card.Footer class="grid grid-cols-2 gap-2">
				<Button variant="outline" disabled={createFoodEntry.isPending} onclick={cancel}>
					{m['common.cancel']()}
				</Button>
				<Button disabled={createFoodEntry.isPending} onclick={log}>
					{#if createFoodEntry.isPending}<Spinner />{:else}{m['common.log']()}{/if}
				</Button>
			</Card.Footer>
		{/if}
	</Card.Root>
{:else if part.state === 'output-error'}
	<Bubble.Root variant="destructive">
		<Bubble.Content>{m['chat.createFailed']()}</Bubble.Content>
	</Bubble.Root>
{/if}
