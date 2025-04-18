<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta
		name="description"
		content="Enter your weight, height, and other essentials to get started"
	/>
</svelte:head>

<form method="POST" use:enhance>
	<Form.Field {form} name="bodyweight">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Bodyweight</Form.Label>
				<Input {...props} bind:value={$formData.bodyweight} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>
