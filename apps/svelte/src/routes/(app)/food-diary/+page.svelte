<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { client } from '$lib/idb-client';
	import { calculateBMR } from '$lib/my-utils';
	import type { Prisma } from '@prisma/client';
	import {
		CalendarIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		ClipboardPasteIcon,
		CopyIcon,
		EllipsisVerticalIcon,
		EqualIcon,
		LoaderCircleIcon,
		MinusIcon,
		PencilIcon,
		PlusIcon,
		ScissorsIcon,
		TrashIcon
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let selectedDay = $state<Date>();
	let foodEntries = $state<Prisma.FoodEntryGetPayload<{ include: { nutritionData: true } }>[]>();
	let caloricIntake = $state<number>(0);
	let caloricTarget = $state<number | undefined | null>();

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
		if (!metrics || !targets) {
			caloricTarget = null;
			return;
		}

		const bmr = calculateBMR(metrics);
		caloricTarget = bmr + targets.caloricChange / 7;
	});

	$effect(() => {
		if (selectedDay) loadFoodEntries(selectedDay);
	});

	async function loadFoodEntries(day: Date) {
		const startOfDay = new Date(day);
		const endOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);

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
		{#if selectedDay}
			<p class="grow text-center text-lg font-semibold">
				{selectedDay?.toLocaleDateString(undefined, { dateStyle: 'long' })}
			</p>
		{:else}
			<Skeleton class="mx-auto h-7 w-32" />
		{/if}
		<Button size="icon" variant="outline" onclick={() => changeDay('next')}>
			<ChevronRightIcon />
		</Button>
	</div>
	<Progress value={caloricIntake} max={caloricTarget ?? Infinity} class="h-2" />
	<div
		class="text-muted-foreground flex h-4 w-full items-center justify-between text-sm font-medium"
	>
		{#if caloricTarget}
			<p>{caloricTarget?.toFixed()}</p>
			<MinusIcon size={16} />
			<p>{caloricIntake.toFixed()}</p>
			<PlusIcon size={16} />
			<p>TBD</p>
			<EqualIcon size={16} />
			<p>{(caloricTarget - caloricIntake).toFixed()}</p>
		{:else if caloricTarget === null}
			<p>Targets and/or metrics haven't been setup</p>
		{:else}
			<p>Fetching data...</p>
			<LoaderCircleIcon class="animate-spin" size={16} />
		{/if}
	</div>
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

{#if !foodEntries}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<LoaderCircleIcon size={128} strokeWidth={1} class="animate-spin" />
		<span>Loading</span>
	</div>
{:else}
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
						<DropdownMenu.Item
							onclick={() => goto(`/food-diary/add/${entry.nutritionDataCode}?edit=${entry.id}`)}
						>
							<PencilIcon /> Edit
						</DropdownMenu.Item>
						<DropdownMenu.Item class="text-red-500" onclick={() => deleteEntry(entry.id)}>
							<TrashIcon /> Delete
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{:else}
		<div class="h-full flex flex-col justify-center items-center gap-2 text-muted-foreground">
			<CalendarIcon size={128} strokeWidth={1} />
			<span>No food entries for this day</span>
		</div>
	{/each}
{/if}
