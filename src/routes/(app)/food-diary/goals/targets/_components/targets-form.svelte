<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import { pascalToNormal } from '$lib/my-utils';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { defaults, superForm, type SuperFormData } from 'sveltekit-superforms/client';
	import {
		macroTrackingTargetsSchema,
		type MacroTrackingTargetsSchema
	} from './targets-form-schema';

	type PropsType = {
		onUpdate?: (event: { form: SuperValidated<MacroTrackingTargetsSchema> }) => unknown;
		formData: SuperFormData<MacroTrackingTargetsSchema>;
	};
	let { onUpdate, formData = $bindable() }: PropsType = $props();

	const form = superForm(defaults(zod4(macroTrackingTargetsSchema)), {
		SPA: true,
		validators: zod4(macroTrackingTargetsSchema),
		resetForm: false,
		onUpdate: (event) => onUpdate?.(event)
	});

	let { enhance } = form;
	({ form: formData } = form);

	const macros = ['proteins', 'carbs', 'fats'] as const;
</script>

<form id="targets-form" use:enhance>
	<Card.Root>
		<Card.Content class="flex flex-col gap-2">
			<Form.Field {form} name="caloricChange" class="flex flex-col items-start">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Weight change per week</Form.Label>
						<div class="bg-background grid w-full grid-cols-2 gap-2 rounded-md border p-4">
							<Slider
								class="col-span-full"
								type="single"
								min={-2}
								step={0.25}
								max={2}
								value={$formData.caloricChange / 7700}
								onValueChange={(value) => ($formData.caloricChange = value * 7700)}
								{...props}
							/>
							<span class="text-muted-foreground">{$formData.caloricChange} kcal</span>
							<span class="text-muted-foreground place-self-end">
								{$formData.caloricChange / 7700} kg
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
				{#each macros as macro (macro)}
					<Form.Field {form} name={macro}>
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center gap-2">
									<Switch
										checked={$formData[macro] !== null}
										onCheckedChange={(checked) => {
											if (checked) $formData[macro] = 0;
											else $formData[macro] = null;
										}}
									/>
									<Form.Label class="grow">{pascalToNormal(macro)}</Form.Label>
									<Input
										type="number"
										min={0}
										step={0.1}
										class="grow-0 basis-1/2 text-center"
										{...props}
										bind:value={$formData[macro]}
									/>
									{#if $formData.quantifier === 'Percentage'}
										<span class="text-muted-foreground">%</span>
									{:else}
										<span class="text-muted-foreground">gm</span>
									{/if}
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</form>
