<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Item from '$lib/components/ui/item';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { useCreateFoodEntry } from '$lib/features/food-diary/food-entry/mutations/create';
	import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/model/schema';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import type { MyUIMessage } from '@myfit/api';
	import { chat } from '../chat.svelte';
	import MacrosPieChart from '../../../food-diary/[date]/components/add-edit-entries/macros-pie-chart.svelte';
	import { CheckIcon } from '@lucide/svelte';

	type CreateFoodEntryPart = Extract<
		MyUIMessage['parts'][number],
		{ type: 'tool-createFoodEntry' }
	>;
	const { part }: { part: CreateFoodEntryPart } = $props();

	const mutation = useCreateFoodEntry();
	const currentUser = useCurrentUser();

	function calc(per100g: number): string {
		if (part.input?.quantityG === undefined) return '-';
		return (Math.round((per100g / 100) * part.input.quantityG * 10) / 10).toString();
	}

	function calcNum(per100g: number): number {
		if (part.input?.quantityG === undefined) return 0;
		return (per100g / 100) * part.input.quantityG;
	}

	let kcal = $derived(calcNum(part.input?.energyKcal_100g ?? 0));
	let protein = $derived(calcNum(part.input?.proteinsG_100g ?? 0));
	let carbs = $derived(calcNum(part.input?.carbohydratesG_100g ?? 0));
	let fat = $derived(calcNum(part.input?.fatG_100g ?? 0));

	async function confirm() {
		if (!currentUser.data?.id) return;

		const { name, ...rest } = part.input!;
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
			await mutation.mutateAsync({ data, userId: currentUser.data.id });
			chat.addToolOutput({
				tool: 'createFoodEntry',
				toolCallId: part.toolCallId,
				output: 'created'
			});
		} catch {
			// toast already shown by mutation onError; keep state at input-available so user can retry
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
	<Item.Root class="mb-2 w-[80%] place-self-start rounded-tl-none bg-card px-3 py-2">
		<Item.Content>
			<Spinner />
		</Item.Content>
	</Item.Root>
{:else if part.state === 'input-available' || part.state === 'output-available'}
	<Item.Root class="mb-2 w-[80%] place-self-start rounded-tl-none bg-card px-3 py-2">
		<Item.Content class="text-left">
			<p class="font-medium">{part.input.name}</p>
			<p class="mb-1 text-xs text-muted-foreground">{part.input.quantityG}g</p>
			<div class="flex items-center gap-3">
				<div class="p-2">
					<MacrosPieChart {kcal} {protein} {carbs} {fat} />
				</div>
				<div class="grid grid-cols-2 gap-x-6 gap-y-0.5 text-sm">
					<span class="text-muted-foreground">Protein</span>
					<span class="text-right">{calc(part.input.proteinsG_100g)}g</span>
					<span class="text-muted-foreground">Carbs</span>
					<span class="text-right">{calc(part.input.carbohydratesG_100g)}g</span>
					<span class="text-muted-foreground">Fat</span>
					<span class="text-right">{calc(part.input.fatG_100g)}g</span>
				</div>
			</div>
			<div class="mt-3 grid grid-cols-2 gap-2">
				<Button
					size="sm"
					variant="outline"
					class="flex-1"
					disabled={mutation.isPending || part.state === 'output-available'}
					onclick={cancel}
				>
					Cancel
				</Button>
				<Button
					size="sm"
					class="flex-1"
					disabled={mutation.isPending || part.state === 'output-available'}
					onclick={confirm}
				>
					{#if mutation.isPending}
						<Spinner />
					{:else if part.state === 'output-available' && part.output === 'created'}
						Logged <CheckIcon />
					{:else}
						Log
					{/if}
				</Button>
			</div>
		</Item.Content>
	</Item.Root>
{:else if part.state === 'output-error'}
	<Item.Root
		class="mb-2 w-fit max-w-[80%] place-self-start rounded-tl-none bg-destructive/10 px-3 py-2"
	>
		<Item.Content>
			<p class="text-sm text-destructive">Failed to create food entry.</p>
		</Item.Content>
	</Item.Root>
{/if}
