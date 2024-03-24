<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	import { templateExerciseSplits } from '$lib/constants';
	import { getTotalSetsOfSplit } from '$lib/utils/exerciseSplits';
	import { exerciseSplitStore } from '../[mode]/exerciseSplitStore';
	import { goto } from '$app/navigation';

	function templateFromSplit(exerciseSplit: ExerciseSplit) {
		$exerciseSplitStore = exerciseSplit;
		goto('/exercise-splits/new?template');
	}
</script>

<H2>New exercise split</H2>
<H3>Use template</H3>

{#each templateExerciseSplits as { description, exerciseSplit }}
	<Button
		variant="outline"
		class="flex h-fit w-full flex-col gap-2 p-2 hover:border-foreground hover:bg-background"
		on:click={() => templateFromSplit(exerciseSplit)}
	>
		<div class="flex w-full items-center justify-between">
			<span class="text-lg font-semibold">{exerciseSplit.name}</span>
			<span class="text-sm text-muted-foreground">
				{getTotalSetsOfSplit(exerciseSplit.splitDays)} sets
			</span>
		</div>
		<p class="-mt-1.5 whitespace-pre-wrap text-justify font-normal text-muted-foreground">
			{description}
		</p>
		<div class="flex w-full flex-wrap gap-1">
			{#each exerciseSplit.splitDays as splitDay}
				<Badge variant={splitDay ? 'secondary' : 'outline'}>
					{splitDay?.name ?? 'Rest'}
				</Badge>
			{/each}
		</div>
	</Button>
{/each}
