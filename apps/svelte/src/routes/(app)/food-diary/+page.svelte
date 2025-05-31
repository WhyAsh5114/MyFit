<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { ChevronLeftIcon, ChevronRightIcon, MenuIcon, PlusIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let selectedDay = $state<Date>();

	onMount(async () => {
		const urlDay = page.url.searchParams.get('day');
		if (urlDay) {
			const parsedDate = new Date(urlDay);
			if (!isNaN(parsedDate.getTime())) selectedDay = parsedDate;
		} else {
			goto(`/food-diary?day=${new Date().toISOString().split('T')[0]}`);
			selectedDay = new Date();
		}
	});

	function changeDay(direction: 'prev' | 'next') {
		if (!selectedDay) return;

		const newDate = new Date(selectedDay);
		if (direction === 'prev') {
			newDate.setDate(newDate.getDate() - 1);
		} else {
			newDate.setDate(newDate.getDate() + 1);
		}
		selectedDay = newDate;
		goto(`/food-diary?day=${newDate.toISOString().split('T')[0]}`);
	}
</script>

<H1>Food diary</H1>

<div class="bg-card flex flex-col items-center gap-2 rounded-md border p-4">
	<div class="flex w-full items-center">
		<Button size="icon" variant="outline" onclick={() => changeDay('prev')}>
			<ChevronLeftIcon />
		</Button>
		<p class="grow text-center text-lg font-semibold">
			{selectedDay?.toLocaleDateString(undefined, { dateStyle: 'long' })}
		</p>
		<Button size="icon" variant="outline" onclick={() => changeDay('next')}>
			<ChevronRightIcon />
		</Button>
	</div>
	<Separator class="my-1" />
	<div class="flex w-full items-center justify-between">
		<span class="text-sm font-medium">Calories remaining</span>
		<Button class="size-4 p-0" variant="ghost">
			<MenuIcon />
		</Button>
	</div>
	<Progress value={33} max={100} class="h-2" />
</div>

<Button class="ml-auto" href={`/food-diary/add?day=${selectedDay?.toISOString().split('T')[0]}`}>
	<PlusIcon /> Add food
</Button>
