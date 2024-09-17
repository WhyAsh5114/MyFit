<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { arraySum, dateToCalendarDate } from '$lib/utils';
	import { getLocalTimeZone, isSameDay, today } from '@internationalized/date';
	import type { DateRange } from 'bits-ui';
	import CustomRangeCalendar from './CustomRangeCalendar.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';

	let { mesocycle }: { mesocycle: NonNullable<RouterOutputs['mesocycles']['findById']> } = $props();

	const workoutStartDates = mesocycle.workoutsOfMesocycle.map((wm) => ({
		date: dateToCalendarDate(wm.workout.startedAt),
		workoutStatus: wm.workoutStatus
	}));
	const startDate = workoutStartDates[0]?.date;

	const completedMesocycleWorkouts = mesocycle.workoutsOfMesocycle.length;
	const totalMesocycleWorkouts = mesocycle.mesocycleExerciseSplitDays.length * arraySum(mesocycle.RIRProgression);
	const remainingMesocycleWorkouts = totalMesocycleWorkouts - completedMesocycleWorkouts;
	const endDate = mesocycle.endDate
		? workoutStartDates.at(-1)!.date
		: today(getLocalTimeZone()).add({ days: remainingMesocycleWorkouts });

	let dateRange: DateRange = $state({ start: startDate, end: endDate });
	let filteredWorkoutsOfMesocycle = $derived(
		mesocycle.workoutsOfMesocycle.filter((wm) => {
			if (!dateRange.start || !dateRange.end) return;
			const workoutDate = dateToCalendarDate(wm.workout.startedAt);
			return workoutDate.compare(dateRange.start) >= 0 && workoutDate.compare(dateRange.end) <= 0;
		})
	);
</script>

<div class="flex h-full flex-col gap-2">
	<CustomRangeCalendar
		class="mx-auto w-fit rounded-md border"
		getDayStatus={(date) => {
			const workoutsOfMesocycleOnThisDay = mesocycle.workoutsOfMesocycle.filter((wm) => {
				return isSameDay(dateToCalendarDate(wm.workout.startedAt), date);
			});
			return workoutsOfMesocycleOnThisDay.map((wm) => wm.workoutStatus);
		}}
		maxValue={endDate}
		minValue={startDate}
		readonly
		bind:value={dateRange}
	/>

	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#each filteredWorkoutsOfMesocycle as { workout, ...workoutOfMesocycle }}
			<Button
				class="flex h-12 items-center justify-between rounded-md border bg-card p-2"
				href="/workouts/{workout.id}"
				variant="outline"
			>
				<span class="text-lg font-semibold">
					{workout.startedAt.toLocaleDateString(undefined, {
						day: '2-digit',
						month: 'long'
					})}
				</span>
				{#if workoutOfMesocycle}
					{@const splitDayName = mesocycle.mesocycleExerciseSplitDays[workoutOfMesocycle.splitDayIndex].name}
					<span class="truncate text-muted-foreground">
						{splitDayName === '' ? 'Rest' : splitDayName}
						{workoutOfMesocycle.workoutStatus === 'Skipped' ? '(skipped)' : ''}
					</span>
				{/if}
			</Button>
		{/each}
	</div>
</div>
