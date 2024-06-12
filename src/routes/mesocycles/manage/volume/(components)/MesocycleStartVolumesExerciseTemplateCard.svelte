<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import Input from '$lib/components/ui/input/input.svelte';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import type { MesocycleExerciseTemplateWithoutIDs } from '../../mesocycleRunes.svelte';

	type ExerciseTemplateCardProps = {
		exerciseTemplate: MesocycleExerciseTemplateWithoutIDs;
	};

	let { exerciseTemplate = $bindable() }: ExerciseTemplateCardProps = $props();
</script>

<div class="flex flex-col gap-0.5 rounded-md border bg-card/50 p-2 backdrop-blur-sm">
	<div class="flex items-center gap-0.5">
		<span class="mr-auto truncate">{exerciseTemplate.name}</span>
		{#if exerciseTemplate.involvesBodyweight}
			<Badge variant="outline">BW</Badge>
		{/if}
		<Badge class="whitespace-nowrap" variant="secondary">
			{exerciseTemplate.targetMuscleGroup === 'Custom'
				? exerciseTemplate.customMuscleGroup
				: convertCamelCaseToNormal(exerciseTemplate.targetMuscleGroup)}
		</Badge>
	</div>
	<div class="flex items-center gap-2">
		<Input
			id="{exerciseTemplate.name}-sets"
			type="number"
			class="w-12 py-0 h-8 text-sm"
			bind:value={exerciseTemplate.sets}
		/>
		<span class="mr-auto text-sm lowercase text-muted-foreground">
			{exerciseTemplate.setType} sets of
			{exerciseTemplate.repRangeStart} to {exerciseTemplate.repRangeEnd} reps
		</span>
	</div>
	{#if exerciseTemplate.note}
		<div class="mt-1 flex items-center bg-secondary px-1 py-0.5 text-sm">
			{exerciseTemplate.note}
		</div>
	{/if}
</div>
