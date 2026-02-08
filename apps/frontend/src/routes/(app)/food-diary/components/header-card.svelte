<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@lucide/svelte';
	import { getRelativeDayLabel, dateFormatter } from './utils';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

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

	$effect(() => {
		if (!page.url.searchParams.has('day')) {
			// @ts-expect-error - SvelteKit's goto doesn't support search params
			goto(resolve(`/food-diary?day=${today(timeZone).toString()}`));
		}
	});

	function changeDay(days: number) {
		selectedDay = selectedDay.add({ days });
		// @ts-expect-error - SvelteKit's goto doesn't support search params
		goto(resolve(`/food-diary?day=${selectedDay.toString()}`));
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
	<Separator />
	<Card.Content class="flex">
		<Button class="ml-auto">Add food <PlusIcon /></Button>
	</Card.Content>
</Card.Root>
