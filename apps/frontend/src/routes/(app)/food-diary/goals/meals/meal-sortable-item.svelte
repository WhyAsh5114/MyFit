<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import type { MealsFormSchema } from '$lib/features/food-diary/meals/schema';
	import * as Form from '$lib/components/ui/form/index.js';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { cn } from '$lib/utils';
	import MealItem from './meal-item.svelte';

	type Props = {
		form: SuperForm<MealsFormSchema>;
		id: string;
		index: number;
		onDelete: () => void;
	};

	let { form, id, index, onDelete }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { form: formData } = form;

	const sortable = createSortable({
		get id() {
			return id;
		},
		get index() {
			return index;
		}
	});
</script>

<div {@attach sortable.attach}>
	<Form.ElementField {form} name="meals[{index}].name">
		<Form.Control>
			{#snippet children({ props })}
				<MealItem
					class={cn({ 'bg-muted *:invisible': sortable.isDragging })}
					gripAttachment={sortable.attachHandle}
					name={$formData.meals.find((m) => m.id === id)!.name}
					inputProps={props}
					onchange={(e) => ($formData.meals[index].name = e.currentTarget.value)}
					{onDelete}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.ElementField>
</div>
