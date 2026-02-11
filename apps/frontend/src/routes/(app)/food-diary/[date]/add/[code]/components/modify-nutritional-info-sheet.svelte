<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form/index.js';
	import {
		AlertCircleIcon,
		CircleCheckIcon,
		InfoIcon,
		PencilIcon,
		XCircleIcon
	} from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { FoodEntryFormSchema } from './food-entry-form-schema';
	import CustomScrollArea from '$lib/components/custom-scroll-area.svelte';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';

	let { form }: { form: SuperForm<FoodEntryFormSchema> } = $props();
	let formData = $derived(form.form);
	let formErrors = $derived(form.allErrors);

	let open = $state(false);

	const requiredFields = [
		{ key: 'energy_kcal_100g', label: 'Calories (kcal)' },
		{ key: 'carbohydrates_100g', label: 'Carbs (g)' },
		{ key: 'fat_100g', label: 'Fats (g)' },
		{ key: 'proteins_100g', label: 'Proteins (g)' }
	] as const;

	const optionalFields = [
		{ key: 'saturated_fat_100g', label: 'Saturated fat (g)' },
		{ key: 'unsaturated_fat_100g', label: 'Unsaturated fat (g)' },
		{ key: 'monounsaturated_fat_100g', label: 'Monounsaturated fat (g)' },
		{ key: 'polyunsaturated_fat_100g', label: 'Polyunsaturated fat (g)' },
		{ key: 'trans_fat_100g', label: 'Trans fat (g)' },
		{ key: 'cholesterol_100g', label: 'Cholesterol (mg)' },
		{ key: 'sugars_100g', label: 'Sugars (g)' },
		{ key: 'polyols_100g', label: 'Polyols (g)' },
		{ key: 'fiber_100g', label: 'Fiber (g)' },
		{ key: 'salt_100g', label: 'Salt (g)' },
		{ key: 'sodium_100g', label: 'Sodium (mg)' },
		{ key: 'alcohol_100g', label: 'Alcohol (g)' },
		{ key: 'vitamin_a_100g', label: 'Vitamin A (IU)' },
		{ key: 'vitamin_d_100g', label: 'Vitamin D (IU)' },
		{ key: 'vitamin_e_100g', label: 'Vitamin E (mg)' },
		{ key: 'vitamin_k_100g', label: 'Vitamin K (µg)' },
		{ key: 'vitamin_c_100g', label: 'Vitamin C (mg)' },
		{ key: 'vitamin_b1_100g', label: 'Vitamin B1 (mg)' },
		{ key: 'vitamin_b2_100g', label: 'Vitamin B2 (mg)' },
		{ key: 'vitamin_b6_100g', label: 'Vitamin B6 (mg)' },
		{ key: 'vitamin_b9_100g', label: 'Vitamin B9 (µg)' },
		{ key: 'folates_100g', label: 'Folates (µg)' },
		{ key: 'vitamin_b12_100g', label: 'Vitamin B12 (µg)' },
		{ key: 'potassium_100g', label: 'Potassium (mg)' },
		{ key: 'calcium_100g', label: 'Calcium (mg)' },
		{ key: 'phosphorus_100g', label: 'Phosphorus (mg)' },
		{ key: 'iron_100g', label: 'Iron (mg)' },
		{ key: 'magnesium_100g', label: 'Magnesium (mg)' },
		{ key: 'zinc_100g', label: 'Zinc (mg)' },
		{ key: 'copper_100g', label: 'Copper (mg)' },
		{ key: 'manganese_100g', label: 'Manganese (mg)' },
		{ key: 'caffeine_100g', label: 'Caffeine (mg)' }
	] as const;

	let hasFieldErrors = $derived.by(() => {
		for (const field of [...requiredFields, ...optionalFields]) {
			if ($formErrors.find(({ path }) => path === field.key)) return true;
		}
		return false;
	});

	let hasCalculationErrors = $derived.by(() => {
		const totalKcal =
			$formData.carbohydrates_100g * 4 + $formData.fat_100g * 9 + $formData.proteins_100g * 4;
		return Math.abs(totalKcal - $formData.energy_kcal_100g) > 0.1 * $formData.energy_kcal_100g; // allow 10% error margin
	});

	function showErrorsToast() {
		toast.error('There are errors in the form', {
			description: `In the fields: ${$formErrors.map((error) => getLabelForField(error.path)).join(', ')}`
		});
	}

	function getLabelForField(key: string) {
		const field = [...requiredFields, ...optionalFields].find((field) => field.key === key);
		return field ? field.label : key;
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		{#snippet child({ props })}
			<Button
				variant="outline"
				type="button"
				class={cn({ 'border-destructive!': hasFieldErrors })}
				{...props}
			>
				Edit nutrition <PencilIcon />
			</Button>
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content class="w-5/6">
		<Sheet.Header>
			<Sheet.Title>Edit nutrition</Sheet.Title>
			<Sheet.Description>
				Edit nutrition for this entry only, original food will remain unchanged.
			</Sheet.Description>
			<div class="flex items-center gap-2 rounded-md border p-2 text-xs text-muted-foreground">
				<InfoIcon class="size-4" /> All values are per 100g of the food
			</div>
		</Sheet.Header>
		<span class="ml-4 font-semibold">Required fields</span>
		<div class="grid grid-cols-2 gap-2 px-4">
			{#each requiredFields as requiredField (requiredField.key)}
				<Form.Field {form} name={requiredField.key}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{requiredField.label}</Form.Label>
							<Input
								{...props}
								type="number"
								step="0.1"
								bind:value={$formData[requiredField.key]}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/each}
		</div>
		<span class="ml-4 font-semibold">Optional fields</span>
		<CustomScrollArea class="h-px grow px-4" viewportClass="scroll-shadow">
			<div class="grid grid-cols-2 gap-2">
				{#each optionalFields as optionalField (optionalField.key)}
					<Form.Field {form} name={optionalField.key}>
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{optionalField.label}</Form.Label>
								<Input
									{...props}
									type="number"
									step="0.1"
									bind:value={$formData[optionalField.key]}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				{/each}
			</div>
		</CustomScrollArea>
		{#if hasFieldErrors}
			<Button class="mx-4 mb-4" type="button" variant="destructive" onclick={showErrorsToast}>
				There are errors in the form <XCircleIcon />
			</Button>
		{:else if hasCalculationErrors}
			<Button
				class="mx-4 mb-4 bg-warning text-warning-foreground"
				type="button"
				onclick={() => (open = false)}
			>
				Potentially inaccurate entries <AlertCircleIcon />
			</Button>
		{:else}
			<Button class="mx-4 mb-4" type="button" onclick={() => (open = false)}>
				Done <CircleCheckIcon />
			</Button>
		{/if}
	</Sheet.Content>
</Sheet.Root>
