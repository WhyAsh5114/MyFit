<script lang="ts">
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import {
		AlertCircleIcon,
		CircleCheckIcon,
		InfoIcon,
		PencilIcon,
		XCircleIcon
	} from '@lucide/svelte';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { ScrollArea } from '#lib/components/ui/scroll-area/index.js';
	import { type SuperForm } from 'sveltekit-superforms';
	import { type FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
	import { toast } from 'svelte-sonner';
	import { cn } from '#lib/utils.js';
	import { m } from '#lib/paraglide/messages.js';
	import {
		nutrientLabel,
		OPTIONAL_NUTRIENTS,
		REQUIRED_NUTRIENTS,
		type NutrientKey
	} from '#lib/features/food-diary/_common/nutrients.js';
	import { hasCalculationErrors } from '#lib/domain/nutrition/energy-check.js';
	import { HistoryOverlay } from '#lib/hooks/history-overlay.svelte.js';

	let { form }: { form: SuperForm<FoodEntryFormSchema> } = $props();
	let formData = $derived(form.form);
	let formErrors = $derived(form.allErrors);

	const NUTRIENTS: { key: NutrientKey }[] = [...REQUIRED_NUTRIENTS, ...OPTIONAL_NUTRIENTS];

	// Part of the entry form. Without a history step, Back would leave the form and lose what the
	// user typed; as one, Back closes only this sheet (DESIGN.md → Surfaces).
	const editor = new HistoryOverlay('nutrition-editor');

	let hasFieldErrors = $derived.by(() => {
		for (const field of NUTRIENTS) {
			if ($formErrors.find(({ path }) => path === field.key)) return true;
		}
		return false;
	});

	function showErrorsToast() {
		toast.error(m['validation.errors'](), {
			description: m['validation.errorFields']({
				fields: $formErrors.map((error) => getLabelForField(error.path)).join(', ')
			})
		});
	}

	function getLabelForField(key: string) {
		const field = NUTRIENTS.find((field) => field.key === key);
		return field ? nutrientLabel(field.key) : key;
	}
</script>

<Sheet.Root bind:open={() => editor.open, (open) => (editor.open = open)}>
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
	<Sheet.Content class="data-[side=right]:w-5/6 data-[side=right]:sm:max-w-lg">
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
		<!-- Required and optional fields scroll together, so a short screen still reaches every field. -->
		<ScrollArea type="scroll" class="mb-2 min-h-0 flex-1" viewportClass="scroll-fade-y">
			<div class="flex flex-col gap-2 px-4">
				<span class="font-semibold">{m['foodDiary.nutritionRequiredFields']()}</span>
				<div class="grid grid-cols-2 gap-2">
					{#each REQUIRED_NUTRIENTS as nutrient (nutrient.key)}
						<Form.Field {form} name={nutrient.key}>
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>{nutrientLabel(nutrient.key)}</Form.Label>
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
				<span class="mt-2 font-semibold">{m['foodDiary.nutritionOptionalFields']()}</span>
				<div class="grid grid-cols-2 gap-2">
					<Form.Field {form} name="servingSize">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['foodDiary.servingSizeLabel']()}</Form.Label>
								<InputGroup.Root>
									<InputGroup.Input {...props} type="text" bind:value={$formData.servingSize} />
								</InputGroup.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="servingQuantity">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['foodDiary.servingQuantityLabel']()}</Form.Label>
								<InputGroup.Root>
									<InputGroup.Input
										{...props}
										type="number"
										bind:value={$formData.servingQuantity}
									/>
									<InputGroup.Addon align="inline-end">
										<InputGroup.Text>
											{m['foodDiary.servingQuantityUnit']()}
										</InputGroup.Text>
									</InputGroup.Addon>
								</InputGroup.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					{#each OPTIONAL_NUTRIENTS as nutrient (nutrient.key)}
						<Form.Field {form} name={nutrient.key}>
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>{nutrientLabel(nutrient.key)}</Form.Label>
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
			</div>
		</ScrollArea>
		{#if hasFieldErrors}
			<Button class="mx-4 mb-4" type="button" variant="destructive" onclick={showErrorsToast}>
				{m['foodDiary.nutritionFormErrors']()}
				<XCircleIcon />
			</Button>
		{:else if hasCalculationErrors($formData.energyKcal_100g, $formData.carbohydratesG_100g, $formData.proteinsG_100g, $formData.fatG_100g)}
			<Button
				class="mx-4 mb-4 bg-warning text-warning-foreground"
				type="button"
				onclick={() => (editor.open = false)}
			>
				{m['foodDiary.nutritionInaccurateEntries']()}
				<AlertCircleIcon />
			</Button>
		{:else}
			<Button class="mx-4 mb-4" type="button" onclick={() => (editor.open = false)}>
				{m['foodDiary.nutritionDone']()}
				<CircleCheckIcon />
			</Button>
		{/if}
	</Sheet.Content>
</Sheet.Root>
