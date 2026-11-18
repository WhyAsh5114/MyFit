<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import Button from '#lib/components/ui/button/button.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { formatDate } from '#lib/format.js';
	import { m } from '#lib/paraglide/messages.js';

	type Props = { selectedDay: CalendarDate; timezone: string };
	let { selectedDay, timezone }: Props = $props();

	function changeDay(days: number) {
		// The route changes the day once its data is loaded, so the date never leads its content.
		goto(resolve(`food-diary/${selectedDay.add({ days }).toString()}`));
	}

	function getRelativeDayLabel(date: CalendarDate) {
		const todayDate = today(getLocalTimeZone());
		const daysDiff = date.compare(todayDate);

		if (daysDiff === 0) return m['foodDiary.headerToday']();
		if (daysDiff === -1) return m['foodDiary.yesterday']();
		if (daysDiff === 1) return m['foodDiary.tomorrow']();
		if (daysDiff < -1) return m['foodDiary.daysAgo']({ count: Math.abs(daysDiff) });
		if (daysDiff > 1) return m['foodDiary.inDays']({ count: daysDiff });
	}
</script>

<div class="mb-2 flex flex-col">
	<div class="flex w-full">
		<Button
			size="icon-sm"
			variant="secondary"
			onclick={() => changeDay(-1)}
			aria-label={m['foodDiary.previousDay']()}
		>
			<ChevronLeftIcon />
		</Button>
		<div class="grid grow place-items-center">
			<Card.Title>{formatDate(selectedDay.toDate(timezone), 'long')}</Card.Title>
			<Card.Description class="label-mono">{getRelativeDayLabel(selectedDay)}</Card.Description>
		</div>
		<Button
			size="icon-sm"
			variant="secondary"
			onclick={() => changeDay(1)}
			aria-label={m['foodDiary.nextDay']()}
		>
			<ChevronRightIcon />
		</Button>
	</div>
</div>
