<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import DeleteIcon from 'virtual:icons/lucide/trash';
	import type { FullWorkoutWithMesoData } from '../+page.server';
	import { toast } from 'svelte-sonner';
	import { trpc } from '$lib/trpc/client';
	import { invalidate, goto } from '$app/navigation';
	import { TRPCClientError } from '@trpc/client';
	import { workoutRunes } from '../../manage/workoutRunes.svelte';

	type PropsType = { workout: FullWorkoutWithMesoData };
	let { workout }: PropsType = $props();
	let deleteConfirmDrawerOpen = $state(false);
	let callingDeleteEndpoint = $state(false);

	function getMinuteDifference(date1: Date, date2: Date): number {
		const msInMinute = 60 * 1000;
		const diffInMs = Math.abs(date1.getTime() - date2.getTime());
		return Math.floor(diffInMs / msInMinute);
	}

	const targetedMuscleGroups = new Set(
		workout.workoutExercises.map((ex) => ex.customMuscleGroup ?? ex.targetMuscleGroup)
	);

	async function editWorkout() {
		workoutRunes.loadWorkout(workout);
		await goto('/workouts/manage/start');
	}

	async function deleteWorkout() {
		callingDeleteEndpoint = true;
		try {
			const response = await trpc().workouts.deleteById.mutate(workout.id);
			toast.success(response.message);
			await invalidate('workouts:all');
			await goto('/workouts');
		} catch (error) {
			if (error instanceof TRPCClientError) toast.error(error.message);
		}
		callingDeleteEndpoint = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center justify-between">
			{workout.startedAt.toLocaleDateString(undefined, {
				day: '2-digit',
				month: 'long'
			})}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger aria-label="workout-options">
					<MenuIcon />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Group>
						{#if workout.workoutOfMesocycle === null || workout.workoutOfMesocycle.workoutStatus === null}
							<DropdownMenu.Item class="gap-2" onclick={editWorkout}>
								<EditIcon /> Edit
							</DropdownMenu.Item>
						{/if}
						<DropdownMenu.Item class="gap-2 text-red-500" on:click={() => (deleteConfirmDrawerOpen = true)}>
							<DeleteIcon /> Delete
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Card.Title>
		<Card.Description>
			{workout.startedAt.toLocaleTimeString(undefined, {
				hour: '2-digit',
				minute: '2-digit'
			})}
			to
			{workout.endedAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
			({getMinuteDifference(workout.endedAt, workout.startedAt)} minutes)
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-3">
		<div class="flex flex-col">
			<span class="text-sm text-muted-foreground">Mesocycle</span>
			{#if workout.workoutOfMesocycle}
				{@const wm = workout.workoutOfMesocycle}
				{@const splitDay = wm.mesocycle.mesocycleExerciseSplitDays[wm.splitDayIndex]}
				<div class="flex items-center justify-between">
					<a class="font-semibold underline" href="/mesocycles/{wm.mesocycle.id}">
						{wm.mesocycle.name}
					</a>
					<Badge class="whitespace-nowrap" variant={wm.workoutStatus === null ? 'secondary' : 'outline'}>
						{wm.workoutStatus === null ? splitDay.name : convertCamelCaseToNormal(wm.workoutStatus)}
					</Badge>
				</div>
			{:else}
				<span class="font-semibold">No mesocycle</span>
			{/if}
		</div>
		<div class="flex flex-col">
			<span class="text-sm text-muted-foreground">User bodyweight</span>
			<span class="font-semibold">{workout.userBodyweight}</span>
		</div>
		{#if workout.note}
			<div class="flex flex-col">
				<span class="text-sm text-muted-foreground">Workout note</span>
				<span class="font-semibold">{workout.note}</span>
			</div>
		{/if}
		{#if workout.workoutOfMesocycle?.workoutStatus === null}
			<div class="flex flex-col gap-1">
				<span class="text-sm text-muted-foreground">Targeted muscle groups</span>
				<div class="flex flex-wrap gap-1">
					{#each targetedMuscleGroups as muscleGroup}
						<Badge variant="secondary">{convertCamelCaseToNormal(muscleGroup)}</Badge>
					{/each}
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<ResponsiveDialog title="Delete workout?" bind:open={deleteConfirmDrawerOpen}>
	{#snippet description()}
		This action cannot be undone.
	{/snippet}
	<Button class="mt-2 gap-2" disabled={callingDeleteEndpoint} onclick={deleteWorkout} variant="destructive">
		{#if callingDeleteEndpoint}
			<LoaderCircle class="animate-spin" />
		{:else}
			Yes, delete
		{/if}
	</Button>
</ResponsiveDialog>
