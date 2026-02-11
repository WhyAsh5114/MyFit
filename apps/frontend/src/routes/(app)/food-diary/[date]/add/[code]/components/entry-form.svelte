<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { CircleCheckBigIcon, ClockIcon, PencilIcon, WeightTildeIcon } from '@lucide/svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm, defaults, dateProxy } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import type { NutritionData } from '@myfit/api/prisma/client';
	import { Spinner } from '$lib/components/ui/spinner';
	import { useCreateFoodEntryMutation } from '$lib/mutations/food-diary/create-food-entry';
	import { Button } from '$lib/components/ui/button';
	import { foodEntryFormSchema } from './food-entry-form-schema';

	let { food }: { food: NutritionData } = $props();

	const createFoodEntryMutation = useCreateFoodEntryMutation();
	let defaultData = $derived({ ...food, id: undefined, eatenAt: new Date(), quantity: 100 });

	// svelte-ignore state_referenced_locally
	const form = superForm(defaults(defaultData, zod4(foodEntryFormSchema)), {
		SPA: true,
		validators: zod4Client(foodEntryFormSchema),
		onUpdate: ({ form }) => {
			console.log(form.errors);
		}
	});

	const eatenAt = dateProxy(form, 'eatenAt', {
		format: 'datetime-local'
	});

	const { form: formData, enhance } = form;
</script>

<form use:enhance id="create-food-entry-form">
	<Card.Root>
		<Card.Content class="grid gap-2">
			<Form.Field {form} name="quantity">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							<WeightTildeIcon class="size-4" />
							Quantity (in grams)
						</Form.Label>
						<Input {...props} type="number" step="0.1" min="0" bind:value={$formData.quantity} />
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
		<Card.Footer>
			<Button variant="outline" type="button" class="ml-auto">
				Modify nutritional info <PencilIcon />
			</Button>
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
