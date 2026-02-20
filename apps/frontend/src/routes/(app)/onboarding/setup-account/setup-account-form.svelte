<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { useUpdateUserName } from '$lib/features/user/mutations/update-user-name';
	import type { User } from 'better-auth';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { SendIcon } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { setupAccountFormSchema } from '$lib/features/user/setup-account.schema';

	let { data }: { data: User } = $props();

	const updateUserName = useUpdateUserName();

	// svelte-ignore state_referenced_locally
	const form = superForm(defaults({ name: data.name }, zod4Client(setupAccountFormSchema)), {
		SPA: true,
		validators: zod4Client(setupAccountFormSchema),
		async onUpdate({ form }) {
			if (!form.valid) return;

			await updateUserName.mutateAsync({
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
	<Form.Button disabled={updateUserName.isPending} class="ml-auto">
		{#if updateUserName.isPending}
			<Spinner />
		{:else}
			Submit <SendIcon />
		{/if}
	</Form.Button>
</form>
