<script lang="ts">
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import { arraySum } from '$lib/utils';
	import { getLocalTimeZone, isSameDay, parseDate, today, type DateValue } from '@internationalized/date';
	import type { FullMesocycle } from '../+layout.server';

	function dateToCalendarDate(date: Date | undefined) {
		if (!date) date = new Date();
		return parseDate(date.toISOString().slice(0, 10));
	}

	let { mesocycle }: { mesocycle: FullMesocycle } = $props();

	const workoutStartDates = mesocycle.workoutsOfMesocycle.map((wm) => ({
		date: dateToCalendarDate(wm.workout.startedAt),
		workoutStatus: wm.workoutStatus
	}));
	const lastWorkoutDate = workoutStartDates.at(-1)!.date;
	const startDate = workoutStartDates[0].date;

	const completedMesocycleWorkouts = mesocycle.workoutsOfMesocycle.length;
	const totalMesocycleWorkouts = mesocycle.mesocycleExerciseSplitDays.length * arraySum(mesocycle.RIRProgression);
	const remainingMesocycleWorkouts = totalMesocycleWorkouts - completedMesocycleWorkouts;
	const endDate = today(getLocalTimeZone()).add({ days: remainingMesocycleWorkouts });

	function isDateUnavailable(date: DateValue) {
		const isDateWithinMesocycleRange = lastWorkoutDate.compare(date) > 0 && date.compare(startDate) > 0;
		if (!isDateWithinMesocycleRange) return false;

		return !workoutStartDates.some(
			({ date: startDate, workoutStatus }) => isSameDay(date, startDate) && workoutStatus === null
		);
	}
</script>

<RangeCalendar
	class="w-fit rounded-md border"
	isDateDisabled={(date) => lastWorkoutDate.compare(date) < 0}
	isDateUnavailable={(date) => isDateUnavailable(date)}
	maxValue={endDate}
	minValue={startDate}
	readonly
	value={{ start: startDate, end: endDate }}
/>
