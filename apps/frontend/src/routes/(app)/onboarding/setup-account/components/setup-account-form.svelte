<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { useUpdateUserNameMutation } from '$lib/features/user/update-user-name.js';
	import type { User } from 'better-auth';
	import { setupAccountFormSchema } from './schema';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { SendIcon } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';

	let { data }: { data: User } = $props();

	const updateUserNameMutation = useUpdateUserNameMutation();

	// svelte-ignore state_referenced_locally
	const form = superForm(defaults({ name: data.name }, zod4Client(setupAccountFormSchema)), {
		SPA: true,
		validators: zod4Client(setupAccountFormSchema),
		async onUpdate({ form }) {
			if (!form.valid) return;

			await updateUserNameMutation.mutateAsync({
				userId: data.id,
				name: form.data.name
			});
			await goto(resolve('/dashboard'));
		}
	});

	const { form: formData, enhance } = form;
</script>

<form use:enhance class="flex flex-col">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m['onboarding.nameLabel']()}</Form.Label>
				<Input {...props} bind:value={$formData.name} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button disabled={updateUserNameMutation.isPending} class="ml-auto">
		{#if updateUserNameMutation.isPending}
			<Spinner />
		{:else}
			Submit <SendIcon />
		{/if}
	</Form.Button>
</form>
