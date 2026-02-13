<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import {
		macroTrackingMetricsSchema,
		type MacroTrackingMetricsSchema
	} from '$lib/schemas/metrics-form-schema';
	import { SaveIcon } from '@lucide/svelte';
	import { useCreateMetricsMutation } from '$lib/mutations/food-diary/create-metrics';

	type Props = { metrics: MacroTrackingMetricsSchema | null; userId: string };
	let { metrics, userId }: Props = $props();

	const createMetricsMutation = useCreateMetricsMutation();

	// svelte-ignore state_referenced_locally
	const form = superForm(metrics ?? defaults(zod4(macroTrackingMetricsSchema)), {
		SPA: true,
		validators: zod4Client(macroTrackingMetricsSchema),
		resetForm: false,
		onUpdate: async ({ form }) => {
			if (!form.valid) return;
			await createMetricsMutation.mutateAsync({ ...form.data, userId });
		}
	});

	const { form: formData, enhance } = form;
</script>

<form use:enhance id="macro-tracking-metrics-form" class="contents">
	<Card.Root>
		<Card.Content class="grid grid-cols-4 gap-2">
			<Form.Field {form} name="bodyweight" class="col-span-3">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Bodyweight</Form.Label>
						<Input {...props} bind:value={$formData.bodyweight} type="number" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="bodyweightUnit">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Unit</Form.Label>
						<Select.Root type="single" bind:value={$formData.bodyweightUnit} name={props.name}>
							<Select.Trigger {...props} class="w-full">
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
			<Form.Field {form} name="heightUnit">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Unit</Form.Label>
						<Select.Root type="single" bind:value={$formData.heightUnit} name={props.name}>
							<Select.Trigger {...props} class="w-full">
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
			<Form.Field {form} name="age" class="col-span-2">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Age</Form.Label>
						<Input {...props} bind:value={$formData.age} type="number" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="bodyFatPercentage" class="col-span-2">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Body fat %</Form.Label>
						<Input {...props} bind:value={$formData.bodyFatPercentage} type="number" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Fieldset {form} name="gender" class="col-span-full">
				<Form.Legend>Gender</Form.Legend>
				<RadioGroup.Root bind:value={$formData.gender} class="col-span-full grid grid-cols-2 gap-2">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								for="gender-male"
								class="grid place-items-center rounded-md border-2 border-muted bg-secondary p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
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
								class="grid place-items-center rounded-md border-2 border-muted bg-secondary p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
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

	<Form.Button class="mt-auto w-full" type="submit">
		Save <SaveIcon />
	</Form.Button>
</form>
