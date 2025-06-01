<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { client } from '$lib/idb-client';
	import { calculateBMR } from '$lib/my-utils';
	import type { Prisma } from '@prisma/client';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		ClipboardPasteIcon,
		CopyIcon,
		EllipsisVerticalIcon,
		MenuIcon,
		PencilIcon,
		PlusIcon,
		ScissorsIcon,
		TrashIcon
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let selectedDay = $state<Date>();
	let foodEntries = $state<Prisma.FoodEntryGetPayload<{ include: { nutritionData: true } }>[]>([]);
	let caloricIntake = $state<number>(0);
	let caloricTarget = $state<number | undefined>();

	onMount(async () => {
		const urlDay = page.url.searchParams.get('day');
		if (urlDay) {
			const parsedDate = new Date(urlDay);
			if (!isNaN(parsedDate.getTime())) selectedDay = parsedDate;
		} else {
			goto(`/food-diary?day=${new Date().toISOString().split('T')[0]}`);
			selectedDay = new Date();
		}

		const metrics = await client.macroMetrics.findFirst();
		const targets = await client.macroTargets.findFirst();
		if (!metrics || !targets) return;

		const bmr = calculateBMR(metrics);
		caloricTarget = bmr + targets.caloricChange / 7;
	});

	$effect(() => {
		if (selectedDay) loadFoodEntries(selectedDay);
	});

	async function loadFoodEntries(day: Date) {
		const startOfDay = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
		const endOfDay = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate() + 1));

		foodEntries = await client.foodEntry.findMany({
			where: {
				eatenAt: {
					gte: startOfDay,
					lt: endOfDay
				}
			},
			orderBy: { eatenAt: 'asc' },
			include: { nutritionData: true }
		});
		caloricIntake = foodEntries.reduce(
			(total, entry) =>
				total + (entry.quantity * (entry.nutritionData?.energy_kcal_100g ?? 0)) / 100,
			0
		);
	}

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

	function deleteEntry(entryId: string) {
		client.foodEntry
			.delete({ where: { id: entryId } })
			.then(() => {
				toast.success('Food entry deleted successfully');
				loadFoodEntries(selectedDay!);
			})
			.catch((error) => {
				console.error('Error deleting food entry:', error);
				toast.error('Failed to delete food entry');
			});
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
	<Progress value={caloricIntake} max={caloricTarget} class="h-2" />
</div>

<div class="bg-card flex gap-2 rounded-md border p-2">
	<Button variant="outline" size="icon">
		<CopyIcon />
	</Button>
	<Button variant="outline" size="icon">
		<ClipboardPasteIcon />
	</Button>
	<Button variant="outline" size="icon">
		<ScissorsIcon />
	</Button>
	<Button class="ml-auto" href={`/food-diary/add?day=${selectedDay?.toISOString().split('T')[0]}`}>
		<PlusIcon /> Add food
	</Button>
</div>

{#each foodEntries as entry (entry.id)}
	<div class="bg-card flex w-full items-start justify-between rounded-md border p-3">
		<div class="flex flex-col">
			<p class="max-w-56 truncate font-semibold">{entry.nutritionData?.product_name}</p>
			<p class="text-muted-foreground text-sm">
				{entry.quantity}g - {(
					entry.nutritionData!.energy_kcal_100g *
					(entry.quantity / 100)
				).toFixed()} calories
			</p>
		</div>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="ghost" size="icon" {...props}>
						<EllipsisVerticalIcon />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item><PencilIcon /> Edit</DropdownMenu.Item>
					<DropdownMenu.Item class="text-red-500" onclick={() => deleteEntry(entry.id)}>
						<TrashIcon /> Delete
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/each}
