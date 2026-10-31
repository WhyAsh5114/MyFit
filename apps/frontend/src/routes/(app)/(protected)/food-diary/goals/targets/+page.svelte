<script lang="ts">
	import { markRecentChange } from '#lib/features/food-diary/recent-change.svelte.js';
	import MacroTargetsForm from './macro-targets-form.svelte';
	import { useCreateMacroTargets } from '#lib/features/food-diary/macro-targets/mutations/create.js';
	import { m } from '#lib/paraglide/messages.js';
	import { SaveIcon } from '@lucide/svelte';
	import type { MacroTargetsSchema } from '#lib/features/food-diary/macro-targets/schema.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const createMacroTargets = useCreateMacroTargets();

	async function handleSubmit(form: MacroTargetsSchema) {
		await createMacroTargets.mutateAsync({ ...form, userId: data.ownerId });
		markRecentChange('targets');
		await goto(resolve('food-diary/goals'));
	}
</script>

<MacroTargetsForm
	initialData={data.macroTargets}
	formId="macro-targets-form"
	onSubmit={handleSubmit}
>
	{#snippet submit()}
		<Button class="mt-auto w-full" type="submit" disabled={createMacroTargets.isPending}>
			{#if createMacroTargets.isPending}
				<Spinner />
			{:else}
				{m['foodDiary.metrics.save']()}
				<SaveIcon />
			{/if}
		</Button>
	{/snippet}
</MacroTargetsForm>
