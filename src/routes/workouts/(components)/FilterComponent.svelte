<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import FilterIcon from 'virtual:icons/lucide/filter';
	import Button from '$lib/components/ui/button/button.svelte';
	import DateRangePicker from './DateRangePicker.svelte';
	import type { DateRange } from 'bits-ui';
	import { today, getLocalTimeZone } from '@internationalized/date';

	const todaysDate = today(getLocalTimeZone());

	let dateRangeValue: DateRange = {
		start: todaysDate.subtract({ days: 20 }),
		end: todaysDate
	};
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button class="grow gap-2" aria-label="search" builders={[builder]} variant="secondary">
			Filters <FilterIcon />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="flex w-11/12 flex-col gap-1">
		<span class="font-semibold">Filters</span>
		<DateRangePicker bind:value={dateRangeValue} />
		<span class="text-sm">
			TODO: mesocycle, workout days, exercise filters, name and muscle groups
		</span>
		<span class="text-sm"> TODO: Clear and submit button </span>
	</Popover.Content>
</Popover.Root>
