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
	} from '$lib/features/food-diary/macro-targets/macro-targets.schema';
	import { pascalToNormal } from '$lib/my-utils';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { defaults, superForm } from 'sveltekit-superforms/client';
	import { REQUIRED_NUTRIENTS } from '$lib/features/food-diary/food-entry/nutrients';
	import { SaveIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { useUpsertMacroTargetsMutation } from '$lib/features/food-diary/macro-targets/upsert-macro-targets';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Spinner } from '$lib/components/ui/spinner';
	import { CALORIES_PER_KILOGRAM } from '$lib/domain/nutrition/constants';

	type Props = { targets: MacroTargetsSchema | null; userId: string };
	let { targets, userId }: Props = $props();

	const upsertMacroTargetsMutation = useUpsertMacroTargetsMutation();

	// svelte-ignore state_referenced_locally
	const form = superForm(
		defaults(targets ? macroTargetsSchema.parse(targets) : undefined, zod4(macroTargetsSchema)),
		{
			SPA: true,
			validators: zod4(macroTargetsSchema),
			onUpdate: async ({ form }) => {
				if (!form.valid) {
					return toast.error('Error saving targets', {
						description: form.errors._errors?.join(', ')
					});
				}
				await upsertMacroTargetsMutation.mutateAsync({ ...form.data, userId });
				toast.success('Targets saved');
				await goto(resolve('/food-diary/goals'));
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<form id="targets-form" use:enhance class="contents">
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
				{#each REQUIRED_NUTRIENTS.filter((n) => n.label !== 'Calories') as nutrient (nutrient.label)}
					<Form.Field {form} name={nutrient.foodEntryKey}>
						<Form.Control>
							{#snippet children({ props })}
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
											bind:value={$formData[nutrient.foodEntryKey]}
										/>
										<InputGroup.Addon align="inline-end">
											<InputGroup.Text>
												{$formData.quantifier === 'Percentage' ? '%' : 'gm'}
											</InputGroup.Text>
										</InputGroup.Addon>
									</InputGroup.Root>
									<ButtonGroup.Text>
										<Switch
											checked={$formData[nutrient.foodEntryKey] !== null}
											onCheckedChange={(checked) => {
												if (checked) $formData[nutrient.foodEntryKey] = 0;
												else $formData[nutrient.foodEntryKey] = null;
											}}
										/>
									</ButtonGroup.Text>
								</ButtonGroup.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<Form.Button class="mt-auto w-full" disabled={upsertMacroTargetsMutation.isPending}>
		{#if upsertMacroTargetsMutation.isPending}
			<Spinner />
		{:else}
			Save <SaveIcon />
		{/if}
	</Form.Button>
</form>
