<script lang="ts">
	import { page } from '$app/state';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { dateFormatter } from '$lib/my-utils';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import { AppleIcon } from '@lucide/svelte';

	const timeZone = getLocalTimeZone();

	let selectedDay = $derived.by(() => {
		const dateParam = page.params.date;
		if (dateParam) {
			try {
				return parseDate(dateParam);
			} catch (error) {
				console.warn(`Invalid date parameter: ${dateParam}`, error);
				return today(timeZone);
			}
		}
		return today(timeZone);
	});
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<AppleIcon />
		</Empty.Media>
		<Empty.Title>No food entries</Empty.Title>
		<Empty.Description>
			No food entries found for {dateFormatter.format(selectedDay.toDate(timeZone))}
		</Empty.Description>
	</Empty.Header>
</Empty.Root>
