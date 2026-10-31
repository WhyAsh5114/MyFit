<script lang="ts">
	import { markRecentChange } from '#lib/features/recent-change.svelte.js';
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
		if (!data.targets) return;
		await createMacroTargets.mutateAsync({ ...form, userId: data.targets.userId });
		markRecentChange('targets');
		await goto(resolve('food-diary/goals'));
	}
</script>

{#if data.targets}
	<MacroTargetsForm
		initialData={data.targets.macroTargets}
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
{/if}
