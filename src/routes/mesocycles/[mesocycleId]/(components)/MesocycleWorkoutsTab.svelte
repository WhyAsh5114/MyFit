<script lang="ts">
	import { arraySum } from '$lib/utils';
	import { getLocalTimeZone, isSameDay, parseDate, today } from '@internationalized/date';
	import type { FullMesocycle } from '../+layout.server';
	import CustomRangeCalendar from './CustomRangeCalendar.svelte';

	function dateToCalendarDate(date: Date | undefined) {
		if (!date) date = new Date();
		return parseDate(date.toISOString().slice(0, 10));
	}

	let { mesocycle }: { mesocycle: FullMesocycle } = $props();

	const workoutStartDates = mesocycle.workoutsOfMesocycle.map((wm) => ({
		date: dateToCalendarDate(wm.workout.startedAt),
		workoutStatus: wm.workoutStatus
	}));
	const startDate = workoutStartDates[0]?.date;

	const completedMesocycleWorkouts = mesocycle.workoutsOfMesocycle.length;
	const totalMesocycleWorkouts = mesocycle.mesocycleExerciseSplitDays.length * arraySum(mesocycle.RIRProgression);
	const remainingMesocycleWorkouts = totalMesocycleWorkouts - completedMesocycleWorkouts;
	const endDate = mesocycle.endDate ? workoutStartDates.at(-1)!.date : today(getLocalTimeZone()).add({ days: remainingMesocycleWorkouts });
</script>

<CustomRangeCalendar
	class="w-fit rounded-md border"
	getDayStatus={(date) => {
		const workoutsOfMesocycleOnThisDay = mesocycle.workoutsOfMesocycle.filter((wm) => {
			return isSameDay(dateToCalendarDate(wm.workout.startedAt), date);
		});
		return workoutsOfMesocycleOnThisDay.map((wm) => wm.workoutStatus);
	}}
	maxValue={endDate}
	minValue={startDate}
	readonly
	value={{ start: startDate, end: endDate }}
/>
