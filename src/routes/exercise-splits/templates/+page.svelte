<svelte:options runes={true} />

<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import ExternalLink from 'virtual:icons/lucide/external-link';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { exerciseSplitTemplates } from '$lib/common/exerciseSplitTemplates';
	import { exerciseSplitRunes, type FullExerciseSplitWithoutIdsOrIndex } from '../manage/exerciseSplitRunes.svelte';
	import { goto } from '$app/navigation';

	function templateExerciseSplit(exerciseSplit: FullExerciseSplitWithoutIdsOrIndex) {
		exerciseSplitRunes.loadExerciseSplit(exerciseSplit);
		goto('/exercise-splits/manage/structure');
	}
</script>

<H2>Exercise split</H2>
<H3>Templates</H3>

{#each exerciseSplitTemplates as { description, exerciseSplit }}
	<Button
		class="mb-1 flex h-fit flex-col rounded-md border bg-card p-2"
		onclick={() => templateExerciseSplit(exerciseSplit)}
		variant="outline"
	>
		<div class="pointer-events-none flex w-full items-center justify-between">
			<span class="text-lg font-semibold">{exerciseSplit.name}</span>
			<Badge>{exerciseSplit.exerciseSplitDays.length} days / cycle</Badge>
		</div>
		<span class="pointer-events-none w-full text-wrap text-left text-muted-foreground">
			{description}
		</span>
	</Button>
{/each}

<Button variant="secondary" class="gap-2" href="https://github.com/WhyAsh5114/MyFit/discussions/173" target="_blank">
	Community-made splits <ExternalLink />
</Button>
