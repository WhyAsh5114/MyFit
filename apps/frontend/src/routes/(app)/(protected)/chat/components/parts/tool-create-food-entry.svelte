<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { useCreateFoodEntry } from '#lib/features/food-diary/food-entry/mutations/create.js';
	import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
	import { resolve } from '$app/paths';
	import { CheckIcon, GroupIcon, XIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import FoodCard from '../../../food-diary/[date]/components/add-edit-entries/food-card.svelte';
	import { getChatPageContext } from '../chat.svelte';
	import { parseLocalDateTime, whenLabel } from '../tools/local-time';

	type CreateFoodEntryPart = Extract<
		MyUIMessage['parts'][number],
		{ type: 'tool-createFoodEntry' }
	>;
	const { part, active }: { part: CreateFoodEntryPart; active: boolean } = $props();

	/** Still waiting on a choice, but the user has typed something else instead. */
	const skipped = $derived(part.state === 'input-available' && !active);

	const context = getChatPageContext();
	const meals = $derived(context.meals);
	const createFoodEntry = useCreateFoodEntry();

	/** The meal the model proposed, matched by name, since that is what the model knows. */
	const proposedMealId = $derived.by(() => {
		const name = part.input?.meal?.trim().toLowerCase();
		if (!name) return null;
		return meals.find((meal) => meal.name.toLowerCase() === name)?.id ?? null;
	});
	/** The user's own pick, once they make one; `undefined` keeps the proposed meal. */
	let pickedMealId = $state<string | null | undefined>(undefined);
	const mealId = $derived(pickedMealId === undefined ? proposedMealId : pickedMealId);
	const mealName = $derived(meals.find((meal) => meal.id === mealId)?.name ?? null);

	/** When the model says it was eaten, or `null` for "now", which is fixed when the user logs it. */
	const eatenAt = $derived(parseLocalDateTime(part.input?.eatenAt));

	async function log() {
		if (!part.input) return;

		// The meal is the one picked on the card, and the time is parsed above, so neither is copied.
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { name, brands, meal, eatenAt: _eatenAt, ...rest } = part.input;
		const data = {
			...rest,
			productName: name,
			brands: brands ?? null,
			eatenAt: eatenAt ?? new Date(),
			servingSize: null,
			servingQuantity: null,
			preferredUnit: 'g' as const,
			mealId
		} as FoodEntryFormSchema;

		try {
			await createFoodEntry.mutateAsync({ data, userId: context.session.userId });
		} catch {
			// The mutation already showed a toast, and the card stays open so the user can retry.
			return;
		}
		await context.session.answer({
			tool: 'createFoodEntry',
			toolCallId: part.toolCallId,
			output: { logged: true, meal: mealName }
		});
	}

	function cancel() {
		void context.session.answer({
			tool: 'createFoodEntry',
			toolCallId: part.toolCallId,
			output: { logged: false, meal: null }
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
			<Card.Description>
				{[part.input.brands, `${part.input.quantityG} g`, eatenAt && whenLabel(eatenAt)]
					.filter(Boolean)
					.join(' · ')}
				{#if part.state === 'output-available' && part.output.logged && part.output.meal}
					· {part.output.meal}
				{/if}
			</Card.Description>
			{#if part.state === 'output-available' || skipped}
				<Card.Action>
					{#if part.state === 'output-available' && part.output.logged}
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
			{#if meals.length > 0}
				<Card.Content>
					<Select.Root
						type="single"
						value={mealId ?? undefined}
						onValueChange={(value) => (pickedMealId = value === '' ? null : value)}
						allowDeselect
					>
						<Select.Trigger class="min-h-11 w-full" aria-label={m['foodDiary.entryMeal']()}>
							<GroupIcon class="size-4 text-muted-foreground" />
							<span class="flex-1 text-start">{mealName ?? m['chat.noMeal']()}</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each meals as meal (meal.id)}
									<Select.Item value={meal.id} label={meal.name}>{meal.name}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</Card.Content>
			{:else}
				<!-- Without meals there is nothing to pick, so the card says where meals come from. -->
				<Card.Content class="flex items-center gap-2 text-muted-foreground">
					<GroupIcon class="size-4 shrink-0" />
					<span class="flex-1">{m['chat.noMealsYet']()}</span>
					<Button
						variant="link"
						class="h-11 px-0"
						href={resolve('/(app)/(protected)/food-diary/goals/meals')}
					>
						{m['chat.setUpMeals']()}
					</Button>
				</Card.Content>
			{/if}
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
