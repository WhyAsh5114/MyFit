<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
	import * as RangeCalendar from '$lib/components/ui/range-calendar/index';
	import { cn } from '$lib/utils.js';
	import CustomRangeCalendarDay from './CustomRangeCalendarDay.svelte';
	import CheckIcon from 'virtual:icons/lucide/check';
	import XIcon from 'virtual:icons/lucide/x';
	import MoonIcon from 'virtual:icons/lucide/moon';
	import type { DateValue } from '@internationalized/date';
	import type { WorkoutStatus } from '@prisma/client';

	type $$Props = RangeCalendarPrimitive.Props & { getDayStatus: (date: DateValue) => (WorkoutStatus | null)[] };

	export let value: $$Props['value'] = undefined;
	export let placeholder: $$Props['placeholder'] = undefined;
	export let weekdayFormat: $$Props['weekdayFormat'] = 'short';
	export let startValue: $$Props['startValue'] = undefined;
	export let getDayStatus: $$Props['getDayStatus'];

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<RangeCalendarPrimitive.Root
	class={cn('p-3', className)}
	{weekdayFormat}
	on:keydown
	bind:value
	bind:placeholder
	bind:startValue
	{...$$restProps}
	let:months
	let:weekdays
>
	<RangeCalendar.Header>
		<RangeCalendar.PrevButton />
		<RangeCalendar.Heading />
		<RangeCalendar.NextButton />
	</RangeCalendar.Header>
	<RangeCalendar.Months>
		{#each months as month}
			<RangeCalendar.Grid>
				<RangeCalendar.GridHead>
					<RangeCalendar.GridRow class="flex">
						{#each weekdays as weekday}
							<RangeCalendar.HeadCell class="w-10">
								{weekday.slice(0, 2)}
							</RangeCalendar.HeadCell>
						{/each}
					</RangeCalendar.GridRow>
				</RangeCalendar.GridHead>
				<RangeCalendar.GridBody>
					{#each month.weeks as weekDates}
						<RangeCalendar.GridRow class="mt-2 w-full">
							{#each weekDates as date}
								{@const dayStatus = getDayStatus(date)}
								<RangeCalendar.Cell class="flex h-10 w-10 flex-col items-center justify-center" {date}>
									<div class="flex h-5 w-full items-center justify-center gap-0.5">
										{#each dayStatus as status}
											{#if status === null}
												<CheckIcon class="h-3 w-3" />
											{:else if status === 'RestDay'}
												<MoonIcon class="h-3 w-3" />
											{:else}
												<XIcon class="h-3 w-3" />
											{/if}
										{/each}
									</div>
									<CustomRangeCalendarDay
										class={dayStatus.length === 0 ? 'text-muted-foreground' : ''}
										{date}
										month={month.value}
									/>
								</RangeCalendar.Cell>
							{/each}
						</RangeCalendar.GridRow>
					{/each}
				</RangeCalendar.GridBody>
			</RangeCalendar.Grid>
		{/each}
	</RangeCalendar.Months>
</RangeCalendarPrimitive.Root>
