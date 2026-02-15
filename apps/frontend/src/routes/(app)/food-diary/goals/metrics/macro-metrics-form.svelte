<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { defaults, superForm, type SuperForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import {
		macroTrackingMetricsSchema,
		type MacroTrackingMetricsSchema
	} from '$lib/features/food-diary/macro-metrics/macro-metrics.schema';
	import { ChevronDownIcon } from '@lucide/svelte';
	import { m } from '$lib/paraglide/messages';
	import { calculateBMR } from '$lib/domain/nutrition/bmr';
	import type { Snippet } from 'svelte';

	type Props = {
		initialData: Partial<MacroTrackingMetricsSchema> | null;
		formId: string;
		onSubmit: (data: MacroTrackingMetricsSchema) => Promise<unknown>;
		submit: Snippet<[{ form: SuperForm<MacroTrackingMetricsSchema> }]>;
	};
	let { initialData, formId, onSubmit, submit }: Props = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(
		defaults(
			initialData ? macroTrackingMetricsSchema.parse(initialData) : undefined,
			zod4(macroTrackingMetricsSchema)
		),
		{
			SPA: true,
			validators: zod4Client(macroTrackingMetricsSchema),
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
		<Card.Content class="grid grid-cols-2 gap-2">
			<Form.Field {form} name="bodyweight">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m['foodDiary.metrics.bodyweight']()}</Form.Label>
						<InputGroup.Root>
							<InputGroup.Input {...props} bind:value={$formData.bodyweight} type="number" />
							<InputGroup.Addon align="inline-end">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<InputGroup.Button
												{...props}
												variant="ghost"
												aria-label={m['foodDiary.metrics.unit']()}
											>
												{$formData.bodyweightUnit ?? 'Pick one'}
												<ChevronDownIcon />
											</InputGroup.Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item onclick={() => ($formData.bodyweightUnit = 'kg')}>
											kg
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => ($formData.bodyweightUnit = 'lb')}>
											lb
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</InputGroup.Addon>
						</InputGroup.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="height">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m['foodDiary.metrics.height']()}</Form.Label>
						<InputGroup.Root>
							<InputGroup.Input {...props} bind:value={$formData.height} type="number" />
							<InputGroup.Addon align="inline-end">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<InputGroup.Button
												{...props}
												variant="ghost"
												aria-label={m['foodDiary.metrics.unit']()}
											>
												{$formData.heightUnit ?? 'Pick one'}
												<ChevronDownIcon />
											</InputGroup.Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item onclick={() => ($formData.heightUnit = 'cm')}>
											cm
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => ($formData.heightUnit = 'in')}>
											in
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</InputGroup.Addon>
						</InputGroup.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="age">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m['foodDiary.metrics.age']()}</Form.Label>
						<InputGroup.Root>
							<InputGroup.Input {...props} bind:value={$formData.age} type="number" />
							<InputGroup.Addon align="inline-end">
								<InputGroup.Text>years</InputGroup.Text>
							</InputGroup.Addon>
						</InputGroup.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="bodyFatPercentage">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m['foodDiary.metrics.bodyFatPercentage']()}</Form.Label>
						<InputGroup.Root>
							<InputGroup.Input {...props} bind:value={$formData.bodyFatPercentage} type="number" />
							<InputGroup.Addon align="inline-end">
								<InputGroup.Text>%</InputGroup.Text>
							</InputGroup.Addon>
						</InputGroup.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Fieldset {form} name="gender" class="col-span-full">
				<Form.Legend>{m['foodDiary.metrics.gender']()}</Form.Legend>
				<RadioGroup.Root bind:value={$formData.gender} class="col-span-full grid grid-cols-2 gap-2">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								for="gender-male"
								class="grid place-items-center rounded-md border-2 border-muted bg-secondary p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
							>
								<RadioGroup.Item value="Male" class="sr-only" aria-label="Male" {...props} />
								{m['foodDiary.metrics.male']()}
							</Form.Label>
						{/snippet}
					</Form.Control>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								for="gender-female"
								class="grid place-items-center rounded-md border-2 border-muted bg-secondary p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
							>
								<RadioGroup.Item value="Female" class="sr-only" aria-label="Female" {...props} />
								{m['foodDiary.metrics.female']()}
							</Form.Label>
						{/snippet}
					</Form.Control>
				</RadioGroup.Root>
			</Form.Fieldset>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Description>Basal Metabolic Rate (BMR)</Card.Description>
			<Card.Title class="text-2xl">{calculateBMR($formData)?.toFixed()} kcal</Card.Title>
		</Card.Header>
	</Card.Root>

	{@render submit({ form })}
</form>
