<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		AlertTriangleIcon,
		CircleCheckBigIcon,
		ClockIcon,
		FolderPenIcon,
		HexagonIcon,
		WeightTildeIcon
	} from '@lucide/svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm, defaults, dateProxy } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import type { NutritionData } from '@myfit/api/prisma/client';
	import { Spinner } from '$lib/components/ui/spinner';
	import { useCreateFoodEntryMutation } from '$lib/features/food-diary/food-entry/create-food-entry';
	import { Button } from '$lib/components/ui/button';
	import { foodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
	import ModifyNutritionalInfoSheet from './modify-nutritional-info-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { REQUIRED_NUTRIENTS } from '$lib/features/food-diary/food-entry/nutrients';
	import { round } from '$lib/my-utils';
	import FoodCard from './food-card.svelte';

	type Props = {
		food?: NutritionData;
		userId: string;
	};

	let { food, userId }: Props = $props();

	const createFoodEntryMutation = useCreateFoodEntryMutation();
	let defaultData = $derived({ ...food, id: undefined, eatenAt: new Date(), quantityG: 100 });

	// svelte-ignore state_referenced_locally
	const form = superForm(defaults(defaultData, zod4(foodEntryFormSchema)), {
		SPA: true,
		validators: zod4Client(foodEntryFormSchema),
		onUpdate: async ({ form }) => {
			if (!form.valid) return toast.error(m['errors.formInvalid']());
			await createFoodEntryMutation.mutateAsync({
				data: form.data,
				userId
			});
			toast.success(m['feedback.foodLogged']());
			await goto(resolve(`/food-diary/${page.params.date}`));
		},
		onChange: async () => {
			const res = await form.validateForm({ update: true });
			if (!res.valid) return;
		}
	});

	const eatenAt = dateProxy(form, 'eatenAt', {
		format: 'datetime-local'
	});

	const { form: formData, enhance } = form;

	let hasCalculationErrors = $derived.by(() => {
		const totalKcal =
			$formData.carbohydrates_100g * 4 + $formData.fat_100g * 9 + $formData.proteins_100g * 4;
		return Math.abs(totalKcal - $formData.energy_kcal_100g) > 0.1 * $formData.energy_kcal_100g; // allow 10% error margin
	});
</script>

<form use:enhance id="create-food-entry-form" class="contents">
	<Card.Root>
		<FoodCard food={$formData} quantityG={$formData.quantityG} />
		<Card.Content class="grid grid-cols-6 gap-2">
			{#if food === undefined}
				<Form.Field {form} name="product_name" class="col-span-3">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>
								<FolderPenIcon class="size-4" />
								{m['foodDiary.entryProductName']()}
							</Form.Label>
							<InputGroup.Root>
								<InputGroup.Input {...props} type="text" bind:value={$formData.product_name} />
							</InputGroup.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="brands" class="col-span-3">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>
								<HexagonIcon class="size-4" />
								{m['foodDiary.entryBrands']()}
							</Form.Label>
							<InputGroup.Root>
								<InputGroup.Input {...props} type="text" bind:value={$formData.brands} />
							</InputGroup.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/if}
			<Form.Field {form} name="quantityG" class="col-span-3">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							<WeightTildeIcon class="size-4" />
							{m['foodDiary.entryQuantity']()}
						</Form.Label>
						<InputGroup.Root>
							<InputGroup.Input
								{...props}
								type="number"
								step={0.01}
								bind:value={$formData.quantityG}
							/>
							<InputGroup.Addon align="inline-end">
								<InputGroup.Text>g</InputGroup.Text>
							</InputGroup.Addon>
						</InputGroup.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="eatenAt" class="col-span-3">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							<ClockIcon class="size-4" />
							{m['foodDiary.entryEatenAt']()}
						</Form.Label>
						<Input {...props} type="datetime-local" bind:value={$eatenAt} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
	</Card.Root>
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				Macros
				{#if hasCalculationErrors}
					<Popover.Root>
						<Popover.Trigger>
							<AlertTriangleIcon class="size-4 text-warning" />
						</Popover.Trigger>
						<Popover.Content align="start" class="w-fit p-2 text-sm text-muted-foreground">
							{m['foodDiary.nutritionInaccurateEntries']()}
						</Popover.Content>
					</Popover.Root>
				{/if}
			</Card.Title>
			<Card.Description>
				For {$formData.quantityG}g
			</Card.Description>
			<Card.Action>
				<ModifyNutritionalInfoSheet {form} {hasCalculationErrors} />
			</Card.Action>
		</Card.Header>
		<Card.Content class="grid grid-cols-6 gap-2">
			{#each REQUIRED_NUTRIENTS as nutrient (nutrient.nutritionDataKey)}
				<Form.Field
					{form}
					name={nutrient.nutritionDataKey}
					class={nutrient.nutritionDataKey === 'energy_kcal_100g' ? 'col-span-6' : 'col-span-2'}
				>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>
								<nutrient.icon class="size-4" />
								{nutrient.label}
							</Form.Label>
							<InputGroup.Root>
								<InputGroup.Input
									{...props}
									type="number"
									step={0.01}
									value={round(
										$formData[nutrient.nutritionDataKey] *
											(($formData.quantityG > 0 ? $formData.quantityG : 100) / 100)
									)}
									onblur={(e) => {
										const value = e.currentTarget.valueAsNumber;
										if (!Number.isFinite(value)) return;

										const factor = $formData.quantityG > 0 ? $formData.quantityG / 100 : 1;
										$formData[nutrient.nutritionDataKey] = round(value / factor, 2);
									}}
								/>
								<InputGroup.Addon align="inline-end">
									<InputGroup.Text>{nutrient.unit}</InputGroup.Text>
								</InputGroup.Addon>
							</InputGroup.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/each}
		</Card.Content>
	</Card.Root>
</form>

<Button
	disabled={createFoodEntryMutation.isPending}
	class="mt-auto"
	form="create-food-entry-form"
	type="submit"
>
	{#if createFoodEntryMutation.isPending}
		<Spinner />
	{:else}
		Log food <CircleCheckBigIcon />
	{/if}
</Button>
