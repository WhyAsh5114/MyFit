<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import CalendarIcon from 'virtual:icons/lucide/calendar';
	import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button';

	let { value = $bindable() }: { value: DateRange } = $props();

	const df = new DateFormatter('en-US', { dateStyle: 'medium' });
	let startValue: DateValue | undefined = $state(undefined);
</script>

<div class="grid gap-2">
	<Popover.Root openFocus>
		<Popover.Trigger asChild let:builder>
			<Button
				class={cn('w-fit justify-start text-left font-normal', !value && 'text-muted-foreground')}
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
				{:else if startValue}
					{df.format(startValue.toDate(getLocalTimeZone()))}
				{:else}
					Pick a date
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0" align="start">
			<RangeCalendar initialFocus placeholder={value?.start} bind:value bind:startValue />
		</Popover.Content>
	</Popover.Root>
</div>
