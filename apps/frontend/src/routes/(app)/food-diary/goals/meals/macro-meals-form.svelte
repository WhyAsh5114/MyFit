<script lang="ts">
	import type { Meal } from '@myfit/api/prisma/client';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { move } from '@dnd-kit/helpers';
	import { PlusIcon } from '@lucide/svelte';
	import { mealsFormSchema, type MealsFormSchema } from '$lib/features/food-diary/meals/schema';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import { defaults, superForm, type SuperForm } from 'sveltekit-superforms';
	import type { Snippet } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import MealSortableItem from './meal-sortable-item.svelte';
	import MealItem from './meal-item.svelte';

	type Props = {
		initialData: Meal[];
		onSubmit: (data: MealsFormSchema) => Promise<unknown>;
		submit: Snippet<[{ form: SuperForm<MealsFormSchema> }]>;
	};

	let { initialData, onSubmit, submit }: Props = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(
		defaults(
			{ meals: initialData.map((meal) => ({ id: meal.id, name: meal.name })) },
			zod4(mealsFormSchema)
		),
		{
			SPA: true,
			dataType: 'json',
			validators: zod4Client(mealsFormSchema),
			resetForm: false,
			onUpdate: async ({ form }) => {
				if (!form.valid) return;
				await onSubmit(form.data);
			}
		}
	);

	const { form: formData, enhance, reset, errors } = form;

	let sortableMeals = $derived($formData.meals.slice());

	function onDragStart() {
		errors.set({} as typeof $errors);
	}

	function onDragOver(event: Parameters<typeof move>[1]) {
		sortableMeals = move(sortableMeals, event);
	}

	function onDragEnd(event: { canceled: boolean }) {
		if (event.canceled) return;
		reset({ data: { meals: sortableMeals }, keepMessage: true });
	}

	function addMeal() {
		$formData.meals = [...$formData.meals, { id: crypto.randomUUID(), name: '' }];
	}

	function deleteMeal(index: number) {
		$formData.meals = $formData.meals.filter((_, i) => i !== index);
	}
</script>

<form use:enhance class="contents">
	<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
		<Card.Root>
			<Card.Header>
				<Card.Title>{m['foodDiary.mealsTitle']()}</Card.Title>
				<Card.Description>{m['foodDiary.mealsDescription']()}</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-2 rounded-lg border p-2">
					{#each sortableMeals as meal, index (meal.id)}
						<MealSortableItem {form} id={meal.id} {index} onDelete={() => deleteMeal(index)} />
					{/each}
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="button" class="w-full" variant="secondary" onclick={addMeal}>
					Add more <PlusIcon />
				</Button>
			</Card.Footer>
		</Card.Root>

		<DragOverlay>
			{#snippet children(source)}
				{@const draggedMeal = sortableMeals.find((meal) => meal.id === source.id)}
				{#if draggedMeal}
					<MealItem class="shadow-lg ring-2 ring-primary/50" name={draggedMeal.name} />
				{/if}
			{/snippet}
		</DragOverlay>

		{@render submit({ form })}
	</DragDropProvider>
</form>
