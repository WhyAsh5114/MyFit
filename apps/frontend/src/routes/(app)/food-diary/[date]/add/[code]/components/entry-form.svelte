<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { CircleCheckBigIcon, ClockIcon, RefreshCcwIcon, WeightTildeIcon } from '@lucide/svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm, defaults, dateProxy } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import type { NutritionData } from '@myfit/api/prisma/client';
	import { Spinner } from '$lib/components/ui/spinner';
	import { useCreateFoodEntryMutation } from '$lib/features/food-diary/food-entry/create-food-entry';
	import { Button } from '$lib/components/ui/button';
	import {
		foodEntryFormSchema,
		type FoodEntryFormSchema
	} from '$lib/features/food-diary/food-entry/food-entry.schema';
	import ModifyNutritionalInfoSheet from './modify-nutritional-info-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	type Props = {
		food: NutritionData;
		userId: string;
		onChange?: (data: FoodEntryFormSchema) => void;
	};

	let { food, onChange, userId }: Props = $props();

	const createFoodEntryMutation = useCreateFoodEntryMutation();
	let defaultData = $derived({ ...food, id: undefined, eatenAt: new Date() });

	// svelte-ignore state_referenced_locally
	const form = superForm(defaults(defaultData, zod4(foodEntryFormSchema)), {
		SPA: true,
		validators: zod4Client(foodEntryFormSchema),
		onUpdate: async ({ form }) => {
			if (!form.valid) return toast.error('Please fix the errors in the form before logging');
			await createFoodEntryMutation.mutateAsync({
				data: form.data,
				userId
			});
			toast.success('Food logged successfully!');
			await goto(resolve(`/food-diary/${page.params.date}`));
		},
		onChange: async () => {
			const res = await form.validateForm({ update: true });
			if (!res.valid) return;
			onChange?.(res.data);
		}
	});

	const eatenAt = dateProxy(form, 'eatenAt', {
		format: 'datetime-local'
	});

	const { form: formData, enhance } = form;

	function resetForm() {
		form.reset();
		onChange?.($formData);
	}
</script>

<form use:enhance id="create-food-entry-form">
	<Card.Root>
		<Card.Content class="grid gap-2">
			<Form.Field {form} name="quantityG">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							<WeightTildeIcon class="size-4" />
							Quantity (in grams)
						</Form.Label>
						<Input {...props} type="number" step="0.1" bind:value={$formData.quantityG} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="eatenAt">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							<ClockIcon class="size-4" />
							Eaten at
						</Form.Label>
						<Input {...props} type="datetime-local" bind:value={$eatenAt} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
		<Card.Footer class="grid grid-cols-2 gap-2">
			<Button variant="outline" onclick={resetForm}>
				<RefreshCcwIcon /> Reset data
			</Button>
			<ModifyNutritionalInfoSheet {form} />
		</Card.Footer>
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
