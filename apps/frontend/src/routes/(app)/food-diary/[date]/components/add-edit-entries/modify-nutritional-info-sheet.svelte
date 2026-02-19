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
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { type SuperForm } from 'sveltekit-superforms';
	import {
		optionalFields,
		requiredFields,
		type FoodEntryFormSchema
	} from '$lib/features/food-diary/food-entry/food-entry.schema';
	import CustomScrollArea from '$lib/components/custom-scroll-area.svelte';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { m } from '$lib/paraglide/messages';
	import {
		OPTIONAL_NUTRIENTS,
		REQUIRED_NUTRIENTS
	} from '$lib/features/food-diary/food-entry/nutrients';

	let { form }: { form: SuperForm<FoodEntryFormSchema> } = $props();
	let formData = $derived(form.form);
	let formErrors = $derived(form.allErrors);

	let open = $state(false);

	let hasFieldErrors = $derived.by(() => {
		for (const field of [...requiredFields, ...optionalFields]) {
			if ($formErrors.find(({ path }) => path === field.key)) return true;
		}
		return false;
	});

	let hasCalculationErrors = $derived.by(() => {
		// Example check: calories should be approximately equal to the sum of macros
		const calculatedKcal =
			$formData.carbohydratesG_100g * 4 + $formData.fatG_100g * 9 + $formData.proteinsG_100g * 4;

		// Allow small margin of error due to rounding and variations in calorie calculations
		return (
			Math.abs(calculatedKcal - $formData.energyKcal_100g) >
			Math.max(10, $formData.energyKcal_100g * 0.1)
		);
	});

	function showErrorsToast() {
		toast.error(m['validation.errors'](), {
			description: m['validation.errorFields']({
				fields: $formErrors.map((error) => getLabelForField(error.path)).join(', ')
			})
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
				variant="secondary"
				size="icon"
				type="button"
				class={cn({ 'border border-destructive!': hasFieldErrors })}
				aria-label={m['foodDiary.nutritionEditTitle']()}
				{...props}
			>
				<PencilIcon />
			</Button>
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content class="w-5/6">
		<Sheet.Header>
			<Sheet.Title>{m['foodDiary.nutritionEditTitle']()}</Sheet.Title>
			<Sheet.Description>
				{m['foodDiary.nutritionEditDescription']()}
			</Sheet.Description>
			<div class="flex items-center gap-2 rounded-md border p-2 text-xs text-muted-foreground">
				<InfoIcon class="size-4" />
				{m['foodDiary.nutritionAllValuesPerHundred']()}
			</div>
		</Sheet.Header>
		<span class="ml-4 font-semibold">{m['foodDiary.nutritionRequiredFields']()}</span>
		<div class="grid grid-cols-2 gap-2 px-4">
			{#each REQUIRED_NUTRIENTS as nutrient (nutrient.key)}
				<Form.Field {form} name={nutrient.key}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{nutrient.label}</Form.Label>
							<InputGroup.Root>
								<InputGroup.Input
									{...props}
									type="number"
									step={0.01}
									bind:value={$formData[nutrient.key]}
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
		</div>
		<span class="ml-4 font-semibold">{m['foodDiary.nutritionOptionalFields']()}</span>
		<CustomScrollArea class="h-px grow px-4" viewportClass="scroll-shadow">
			<div class="grid grid-cols-2 gap-2">
				{#each OPTIONAL_NUTRIENTS as nutrient (nutrient.key)}
					<Form.Field {form} name={nutrient.key}>
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{nutrient.label}</Form.Label>
								<InputGroup.Root>
									<InputGroup.Input
										{...props}
										type="number"
										step={0.01}
										bind:value={$formData[nutrient.key]}
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
			</div>
		</CustomScrollArea>
		{#if hasFieldErrors}
			<Button class="mx-4 mb-4" type="button" variant="destructive" onclick={showErrorsToast}>
				{m['foodDiary.nutritionFormErrors']()}
				<XCircleIcon />
			</Button>
		{:else if hasCalculationErrors}
			<Button
				class="mx-4 mb-4 bg-warning text-warning-foreground"
				type="button"
				onclick={() => (open = false)}
			>
				{m['foodDiary.nutritionInaccurateEntries']()}
				<AlertCircleIcon />
			</Button>
		{:else}
			<Button class="mx-4 mb-4" type="button" onclick={() => (open = false)}>
				{m['foodDiary.nutritionDone']()}
				<CircleCheckIcon />
			</Button>
		{/if}
	</Sheet.Content>
</Sheet.Root>
