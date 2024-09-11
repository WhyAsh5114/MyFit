<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	type $$Props = RangeCalendarPrimitive.DayProps;

	export let date: $$Props['date'];
	export let month: $$Props['month'];
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<RangeCalendarPrimitive.Day
	class={cn(
		buttonVariants({ variant: 'ghost' }),
		'h-9 w-9 p-0 font-normal data-[selected]:opacity-100',
		'[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
		// Outside months
		'data-[outside-month]:pointer-events-none data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 [&[data-outside-month][data-selected]]:bg-accent/50 [&[data-outside-month][data-selected]]:text-muted-foreground [&[data-outside-month][data-selected]]:opacity-30',
		// Disabled
		'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
		// Unavailable
		'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through',
		className
	)}
	{date}
	{month}
	on:click
	{...$$restProps}
	let:builder
	let:disabled
	let:unavailable
>
	<slot {builder} {disabled} {unavailable}>
		{date.day}
	</slot>
</RangeCalendarPrimitive.Day>
