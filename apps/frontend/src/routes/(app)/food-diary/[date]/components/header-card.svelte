<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@lucide/svelte';
	import { getRelativeDayLabel } from './utils';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import { dateFormatter } from '$lib/my-utils';
	import { m } from '$lib/paraglide/messages';

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

	function changeDay(days: number) {
		selectedDay = selectedDay.add({ days });
		goto(resolve(`/food-diary/${selectedDay.toString()}`));
	}
</script>

<Card.Root>
	<Card.Header class="flex flex-col gap-4">
		<div class="flex w-full">
			<Button size="icon" variant="outline" onclick={() => changeDay(-1)}>
				<ChevronLeftIcon />
			</Button>
			<div class="grid grow place-items-center">
				<Card.Title>{dateFormatter.format(selectedDay.toDate(timeZone))}</Card.Title>
				<Card.Description class="text-xs">{getRelativeDayLabel(selectedDay)}</Card.Description>
			</div>
			<Button size="icon" variant="outline" onclick={() => changeDay(1)}>
				<ChevronRightIcon />
			</Button>
		</div>
		<Progress value={10} max={100} />
	</Card.Header>
</Card.Root>

<Button class="ml-auto" href={resolve(`/food-diary/${selectedDay.toString()}/add`)}>
	{m['foodDiary.headerAddFood']()} <PlusIcon />
</Button>
