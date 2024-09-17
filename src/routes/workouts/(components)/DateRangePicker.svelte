<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import CalendarIcon from 'virtual:icons/lucide/calendar';
	import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import { cn, dateToCalendarDate } from '$lib/utils.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button';

	type PropsType = {
		value: DateRange;
		firstWorkoutDate: Date;
		lastWorkoutDate: Date;
	};
	let { value = $bindable(), firstWorkoutDate, lastWorkoutDate }: PropsType = $props();

	const df = new DateFormatter('en-US', { dateStyle: 'medium' });
</script>

<div class="grid gap-2">
	<Popover.Root openFocus>
		<Popover.Trigger asChild let:builder>
			<Button
				class={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}
				builders={[builder]}
				variant="outline"
			>
				<CalendarIcon class="mr-2 h-4 w-4" />
				{#if value && value.start}
					{#if value.end}
						{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(value.end.toDate(getLocalTimeZone()))}
					{:else}
						{df.format(value.start.toDate(getLocalTimeZone()))}
					{/if}
				{:else if firstWorkoutDate}
					{df.format(dateToCalendarDate(firstWorkoutDate).toDate(getLocalTimeZone()))}
				{:else}
					Pick a date
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto border-none p-0" align="start">
			<RangeCalendar
				class="w-fit rounded-md border"
				initialFocus
				minValue={dateToCalendarDate(firstWorkoutDate)}
				maxValue={dateToCalendarDate(lastWorkoutDate)}
				bind:value
			/>
		</Popover.Content>
	</Popover.Root>
</div>
