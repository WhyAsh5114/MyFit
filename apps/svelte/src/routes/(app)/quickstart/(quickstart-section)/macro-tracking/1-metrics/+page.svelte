<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte';
	import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { macroTrackingQuickstartState } from '../macro-tracking-quickstart-state.svelte';
	import { macroTrackingMetricsSchema, type MacroTrackingMetricsSchema } from './schema';

	let { data }: { data: { form: SuperValidated<Infer<MacroTrackingMetricsSchema>> } } = $props();

	const form = superForm(data.form, {
		SPA: true,
		validators: zodClient(macroTrackingMetricsSchema),
		resetForm: false,
		onUpdate: async ({ form }) => {
			if (!form.valid) return;
			macroTrackingQuickstartState.macroTrackingMetrics = form.data;
			await selectedStepsState.navigateToPage(page.url.pathname, 'next');
		}
	});

	let { form: formData, enhance } = form;

	$effect(() => {
		if (macroTrackingQuickstartState.macroTrackingMetrics) {
			$formData = macroTrackingQuickstartState.macroTrackingMetrics;
		}
	});
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta
		name="description"
		content="Enter your weight, height, and other essentials to get started"
	/>
</svelte:head>

<form use:enhance id="macro-tracking-metrics-form">
	<Card.Root>
		<Card.Content class="grid grid-cols-4 gap-2 p-4">
			<Form.Field {form} name="bodyweight" class="col-span-3">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Bodyweight</Form.Label>
						<Input {...props} bind:value={$formData.bodyweight} type="number" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="bodyweightUnit" class="basis-1/4">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Unit</Form.Label>
						<Select.Root type="single" bind:value={$formData.bodyweightUnit} name={props.name}>
							<Select.Trigger {...props}>
								{$formData.bodyweightUnit ?? 'Pick one'}
							</Select.Trigger>
							<Select.Content align="end">
								<Select.Item value="kg" label="kg" />
								<Select.Item value="lb" label="lb" />
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="height" class="col-span-3">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Height</Form.Label>
						<Input {...props} bind:value={$formData.height} type="number" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="heightUnit" class="basis-1/4">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Unit</Form.Label>
						<Select.Root type="single" bind:value={$formData.heightUnit} name={props.name}>
							<Select.Trigger {...props}>
								{$formData.heightUnit ?? 'Pick one'}
							</Select.Trigger>
							<Select.Content align="end">
								<Select.Item value="cm" label="cm" />
								<Select.Item value="in" label="in" />
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="age" class="col-span-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Age</Form.Label>
						<Input {...props} bind:value={$formData.age} type="number" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Fieldset {form} name="gender" class="col-span-full">
				<Form.Legend>Gender</Form.Legend>
				<RadioGroup.Root bind:value={$formData.gender} class="col-span-full grid grid-cols-2">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								for="gender-male"
								class="border-muted hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary grid place-items-center rounded-md border-2 p-4"
							>
								<RadioGroup.Item value="Male" class="sr-only" aria-label="Male" {...props} />
								Male
							</Form.Label>
						{/snippet}
					</Form.Control>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								for="gender-female"
								class="border-muted hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary grid place-items-center rounded-md border-2 p-4"
							>
								<RadioGroup.Item value="Female" class="sr-only" aria-label="Female" {...props} />
								Female
							</Form.Label>
						{/snippet}
					</Form.Control>
				</RadioGroup.Root>
			</Form.Fieldset>
		</Card.Content>
	</Card.Root>
</form>

<div class="mt-auto grid grid-cols-2 gap-2">
	<Button
		variant="secondary"
		onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
	>
		<ChevronLeftIcon /> Previous
	</Button>
	<Button type="submit" form="macro-tracking-metrics-form">Next <ChevronRightIcon /></Button>
</div>
