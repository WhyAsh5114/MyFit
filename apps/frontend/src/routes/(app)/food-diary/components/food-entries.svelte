<script lang="ts">
	import { page } from '$app/state';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import { AppleIcon } from '@lucide/svelte';
	import { dateFormatter } from './utils';

	const timeZone = getLocalTimeZone();

	let selectedDay = $derived.by(() => {
		const dayParam = page.url.searchParams.get('day');
		if (dayParam) {
			try {
				return parseDate(dayParam);
			} catch (error) {
				console.warn(`Invalid date parameter: ${dayParam}`, error);
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
