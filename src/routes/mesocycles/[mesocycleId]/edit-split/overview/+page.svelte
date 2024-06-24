<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { trpc } from '$lib/trpc/client';
	import { TRPCClientError } from '@trpc/client';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { mesocycleExerciseSplitRunes } from '../mesocycleExerciseSplitRunes.svelte';
	import MesocycleExerciseSplitStats from '../../(components)/MesocycleExerciseSplitStats.svelte';

	let savingMesocycleExerciseSplit = $state(false);

	async function saveMesocycleExerciseSplit() {
		savingMesocycleExerciseSplit = true;
		try {
			const { message } = await trpc().mesocycles.updateExerciseSplit.mutate({
				mesocycleExerciseSplitDays: mesocycleExerciseSplitRunes.splitDays,
				mesocycleExerciseTemplates: mesocycleExerciseSplitRunes.splitExercises,
				mesocycleId: mesocycleExerciseSplitRunes.mesocycle?.id as string
			});
			toast.success(message);
			await goto(`/mesocycles/${mesocycleExerciseSplitRunes.mesocycle?.id}`);
			mesocycleExerciseSplitRunes.resetStores();
		} catch (error) {
			if (error instanceof TRPCClientError) toast.error(error.message);
		}
		savingMesocycleExerciseSplit = false;
	}
</script>

<H3>Overview</H3>

<MesocycleExerciseSplitStats splitExercises={mesocycleExerciseSplitRunes.splitExercises} />
<div class="mt-2 grid grid-cols-2 gap-1">
	<Button variant="secondary" href="./exercises">Previous</Button>
	<Button onclick={saveMesocycleExerciseSplit} disabled={savingMesocycleExerciseSplit}>
		{#if !savingMesocycleExerciseSplit}
			Save
		{:else}
			<LoaderCircle class="animate-spin" />
		{/if}
	</Button>
</div>
