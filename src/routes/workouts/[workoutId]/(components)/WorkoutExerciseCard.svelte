<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import MiniSetIcon from 'virtual:icons/lucide/arrow-down-right';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import type { FullWorkoutWithMesoData } from '../+page.server';
	import * as Table from '$lib/components/ui/table';

	type PropsType = { exercise: FullWorkoutWithMesoData['workoutExercises'][number] };
	let { exercise }: PropsType = $props();
</script>

<div class="flex flex-col gap-0.5 rounded-md border bg-card/50 p-2 backdrop-blur-sm">
	<span class="truncate">{exercise.name}</span>
	<div class="flex items-center gap-0.5">
		<span class="mr-auto text-sm lowercase text-muted-foreground">
			{exercise.sets.length}
			{convertCamelCaseToNormal(exercise.setType)} sets of
			{exercise.repRangeStart} to {exercise.repRangeEnd} reps
		</span>
		{#if exercise.bodyweightFraction}
			<Badge variant="outline">BW</Badge>
		{/if}
		<Badge class="whitespace-nowrap" variant="secondary">
			{exercise.targetMuscleGroup === 'Custom'
				? exercise.customMuscleGroup
				: convertCamelCaseToNormal(exercise.targetMuscleGroup)}
		</Badge>
	</div>
	{#if exercise.note}
		<div class="mt-1 flex items-center bg-secondary px-1 py-0.5 text-sm">
			{exercise.note}
		</div>
	{/if}
	<Table.Root class="mt-1">
		<Table.Header>
			<Table.Row class="h-2 border-none bg-secondary">
				<Table.Head class="h-7 w-5"></Table.Head>
				<Table.Head class="h-7 text-center text-foreground">Reps</Table.Head>
				<Table.Head class="h-7 text-center text-foreground">Load</Table.Head>
				<Table.Head class="h-7 text-center text-foreground">RIR</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each exercise.sets as set}
				<Table.Row class="border-none">
					<Table.Cell class="px-1 py-1.5 font-medium">{set.setIndex + 1}</Table.Cell>
					<Table.Cell class="px-1 py-1.5 text-center font-light">{set.reps}</Table.Cell>
					<Table.Cell class="px-1 py-1.5 text-center font-light">{set.load}</Table.Cell>
					<Table.Cell class="px-1 py-1.5 text-center font-light">{set.RIR}</Table.Cell>
				</Table.Row>
				{#each set.miniSets as miniSet}
					<Table.Row class="border-none bg-muted/50">
						<Table.Cell class="flex items-center px-1 py-1.5 font-medium">
							<MiniSetIcon />
							{miniSet.miniSetIndex + 1}
						</Table.Cell>
						<Table.Cell class="px-1 py-1.5 text-center font-light">{miniSet.reps}</Table.Cell>
						<Table.Cell class="px-1 py-1.5 text-center font-light">{miniSet.load}</Table.Cell>
						<Table.Cell class="px-1 py-1.5 text-center font-light">{miniSet.RIR}</Table.Cell>
					</Table.Row>
				{/each}
			{/each}
		</Table.Body>
	</Table.Root>
</div>
