<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import {
		macroTargetsSchema,
		type MacroTargetsSchema
	} from '$lib/features/food-diary/macro-targets/schema';
	import { pascalToNormal } from '$lib/my-utils';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import { defaults, superForm, type SuperForm } from 'sveltekit-superforms';
	import { REQUIRED_NUTRIENTS } from '$lib/features/food-diary/food-entry/model/nutrients';
	import { CALORIES_PER_KILOGRAM } from '$lib/domain/nutrition/constants';
	import type { Snippet } from 'svelte';

	type Props = {
		initialData: Partial<MacroTargetsSchema> | null;
		formId: string;
		onSubmit: (data: MacroTargetsSchema) => Promise<unknown>;
		submit: Snippet<[{ form: SuperForm<MacroTargetsSchema> }]>;
	};
	let { initialData, formId, onSubmit, submit }: Props = $props();

	// Map macro target field names to nutrient labels and form field names
	const macroFields = [
		{ label: 'Protein', formField: 'proteinG' as const },
		{ label: 'Carbs', formField: 'carbsG' as const },
		{ label: 'Fat', formField: 'fatG' as const }
	];

	// svelte-ignore state_referenced_locally
	const form = superForm(
		defaults(
			initialData ? macroTargetsSchema.parse(initialData) : undefined,
			zod4(macroTargetsSchema)
		),
		{
			SPA: true,
			validators: zod4Client(macroTargetsSchema),
			resetForm: false,
			onUpdate: async ({ form }) => {
				if (!form.valid) return;
				await onSubmit(form.data);
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance id={formId} class="contents">
	<Card.Root>
		<Card.Content class="flex flex-col gap-2">
			<Form.Field {form} name="weeklyCaloricChange" class="flex flex-col items-start">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Weight change per week</Form.Label>
						<div class="grid w-full grid-cols-2 gap-2 rounded-md border bg-background p-4">
							<Slider
								class="col-span-full"
								type="single"
								min={-2}
								step={0.25}
								max={2}
								value={$formData.weeklyCaloricChange / CALORIES_PER_KILOGRAM}
								onValueChange={(value) => ($formData.weeklyCaloricChange = value * CALORIES_PER_KILOGRAM)}
								{...props}
							/>
							<span class="text-muted-foreground">{$formData.weeklyCaloricChange} kcal</span>
							<span class="place-self-end text-muted-foreground">
								{$formData.weeklyCaloricChange / CALORIES_PER_KILOGRAM} kg
							</span>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="quantifier">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Macro targets</Form.Label>
						<Select.Root type="single" bind:value={$formData.quantifier} {...props}>
							<Select.Trigger class="w-full">
								{pascalToNormal($formData.quantifier)}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="Percentage">Percentage (%)</Select.Item>
								<Select.Item value="Absolute">Absolute (gm)</Select.Item>
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="grid">
				{#each macroFields as { label, formField } (label)}
					<Form.Field {form} name={formField}>
						<Form.Control>
							{#snippet children({ props })}
								{@const nutrient = REQUIRED_NUTRIENTS.find(n => n.label === label)}
								{#if nutrient}
									<ButtonGroup.Root>
										<InputGroup.Root class="w-fit">
											<InputGroup.Addon class="w-26 justify-start">
												<nutrient.icon />
												{nutrient.label}
											</InputGroup.Addon>
											<InputGroup.Input
												type="number"
												class="border-l"
												min={0}
												step={0.1}
												{...props}
												bind:value={$formData[formField]}
											/>
											<InputGroup.Addon align="inline-end">
												<InputGroup.Text>
													{$formData.quantifier === 'Percentage' ? '%' : 'gm'}
												</InputGroup.Text>
											</InputGroup.Addon>
										</InputGroup.Root>
										<ButtonGroup.Text>
											<Switch
												checked={$formData[formField] !== null}
												onCheckedChange={(checked) => {
													if (checked) $formData[formField] = 0;
													else $formData[formField] = null;
												}}
											/>
										</ButtonGroup.Text>
									</ButtonGroup.Root>
								{/if}
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	{@render submit({ form })}
</form>
