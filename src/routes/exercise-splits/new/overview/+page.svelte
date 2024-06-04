<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import ExerciseSplitCharts from '../../(components)/ExerciseSplitOverviewCharts.svelte';
	import type { ExerciseSplitRuneDataType } from '../../+page.server';

	let savingExerciseSplit = $state(false);
</script>

<H3>Overview</H3>
<Card.Root class="p-4">
	<ExerciseSplitCharts splitExercises={exerciseSplitRunes.splitExercises} />
</Card.Root>

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button variant="secondary" href="./exercises">Previous</Button>
	<form
		method="POST"
		class="contents"
		action="/exercise-splits?/create_exercise_split"
		use:enhance={({ formData }) => {
			savingExerciseSplit = true;
			const exerciseSplitRuneData = JSON.stringify({
				splitName: exerciseSplitRunes.splitName,
				splitDays: exerciseSplitRunes.splitDays,
				splitExercises: exerciseSplitRunes.splitExercises
			} satisfies ExerciseSplitRuneDataType);

			formData.set('exerciseSplitRuneData', exerciseSplitRuneData);
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success(result.data?.message as string);
					await goto('/exercise-splits');
					exerciseSplitRunes.resetStores();
				} else if (result.type === 'failure') {
					toast.error(result.data?.message as string);
				}
			};
		}}
	>
		<Button class="gap-2" type="submit" disabled={savingExerciseSplit}>
			Save
			{#if savingExerciseSplit}
				<LoaderCircle class="animate-spin" />
			{/if}
		</Button>
	</form>
</div>
