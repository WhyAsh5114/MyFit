<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import MenuIcon from 'virtual:icons/lucide/menu';

	import type { ExerciseSplit, ExerciseSplitDay } from '@prisma/client';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	type ExerciseSplitWithSplitDays = ExerciseSplit & { exerciseSplitDays: ExerciseSplitDay[] };

	let { data } = $props();
	let exerciseSplit: ExerciseSplitWithSplitDays | 'loading' = $state('loading');

	onMount(async () => {
		const serverExerciseSplit = await data.exerciseSplit;
		if (serverExerciseSplit) exerciseSplit = serverExerciseSplit;
		else toast.error('Exercise split not found');
	});
</script>

<H2>View exercise split</H2>
{#if exerciseSplit === 'loading'}{:else}
	<div class="flex flex-col gap-4 rounded-md border bg-card p-4">
		<div class="flex justify-between">
			<div class="flex flex-col">
				<span class="text-sm text-muted-foreground">Exercise split name</span>
				<span class="font-semibold">{exerciseSplit.name}</span>
			</div>
			<Button size="icon" variant="ghost">
				<MenuIcon />
			</Button>
		</div>
		<div class="flex flex-col gap-1">
			<span class="text-sm text-muted-foreground">Exercise split schedule</span>
			<div class="flex flex-wrap gap-1">
				{#each exerciseSplit.exerciseSplitDays as splitDay}
					{#if splitDay.isRestDay}
						<Badge variant="outline">Rest</Badge>
					{:else}
						<Badge variant="secondary">{splitDay.name}</Badge>
					{/if}
				{/each}
			</div>
		</div>
	</div>
{/if}
