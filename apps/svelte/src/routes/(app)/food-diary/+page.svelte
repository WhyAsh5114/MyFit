<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { client } from '$lib/idb-client';
	import { calculateBMR } from '$lib/my-utils';
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
	} from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { SvelteDate } from 'svelte/reactivity';

	let selectedDay = $state<SvelteDate>();

	const macroDataQuery = createQuery(() => ({
		queryKey: ['macro-data'],
		queryFn: async () => {
			const metrics = await client.macroMetrics.findFirst();
			const targets = await client.macroTargets.findFirst();

			if (!metrics || !targets) return null;

			const bmr = calculateBMR(metrics);
			return {
				caloricTarget: bmr + targets.caloricChange / 7,
				metrics,
				targets
			};
		}
	}));

	const foodEntriesQuery = createQuery(() => ({
		queryKey: ['food-entries', selectedDay?.toISOString().split('T')[0]],
		queryFn: async () => {
			if (!selectedDay) return [];

			const startOfDay = new Date(selectedDay);
			const endOfDay = new Date(
				selectedDay.getFullYear(),
				selectedDay.getMonth(),
				selectedDay.getDate() + 1
			);

			return await client.foodEntry.findMany({
				where: {
					eatenAt: {
						gte: startOfDay,
						lt: endOfDay
					}
				},
				include: { nutritionData: true },
				orderBy: { eatenAt: 'asc' }
			});
		},
		enabled: Boolean(selectedDay)
	}));

	let caloricIntake = $derived(
		foodEntriesQuery.data?.reduce((sum, entry) => {
			return sum + (entry.nutritionData?.energy_kcal_100g || 0) * (entry.quantity / 100);
		}, 0) || 0
	);

	// Initialize selected day from URL or default to today
	$effect(() => {
		const urlDay = page.url.searchParams.get('day');
		if (urlDay) {
			const parsedDate = new Date(urlDay);
			if (!isNaN(parsedDate.getTime())) {
				selectedDay = new SvelteDate(parsedDate);
				return;
			}
		}

		if (!selectedDay) {
			const today = new SvelteDate();
			goto(`/food-diary?day=${today.toISOString().split('T')[0]}`);
			selectedDay = today;
		}
	});

	function changeDay(direction: 'prev' | 'next') {
		if (!selectedDay) return;

		const newDate = new SvelteDate(selectedDay);
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
				foodEntriesQuery.refetch();
			})
			.catch((error) => {
				console.error('Error deleting food entry:', error);
				toast.error('Failed to delete food entry');
			});
	}
</script>

<H1>Food diary</H1>

<Card.Root class="py-4">
	<Card.Content class="flex flex-col gap-2 px-4">
		<div class="flex w-full items-center">
			<Button size="icon" variant="secondary" onclick={() => changeDay('prev')}>
				<ChevronLeftIcon />
			</Button>
			{#if selectedDay}
				<p class="grow text-center text-base font-semibold">
					{selectedDay?.toLocaleDateString(undefined, { dateStyle: 'long' })}
				</p>
			{:else}
				<Skeleton class="mx-auto h-7 w-32" />
			{/if}
			<Button size="icon" variant="secondary" onclick={() => changeDay('next')}>
				<ChevronRightIcon />
			</Button>
		</div>
		<Progress
			value={caloricIntake}
			max={macroDataQuery.data?.caloricTarget ?? Infinity}
			class="h-2"
		/>
		<div
			class="text-muted-foreground flex h-4 w-full items-center justify-between text-sm font-medium"
		>
			{#if macroDataQuery.data}
				<p>{macroDataQuery.data?.caloricTarget?.toFixed()}</p>
				<MinusIcon size={16} />
				<p>{caloricIntake.toFixed()}</p>
				<PlusIcon size={16} />
				<p>TBD</p>
				<EqualIcon size={16} />
				<p>{(macroDataQuery.data?.caloricTarget - caloricIntake).toFixed()}</p>
			{:else if macroDataQuery.data === null}
				<p class="w-full text-center">
					Goals haven't been setup. <a href="/food-diary/goals" class="underline">Set up now!</a>
				</p>
			{:else}
				<p>Fetching data...</p>
				<LoaderCircleIcon class="animate-spin" size={16} />
			{/if}
		</div>
		<Separator class="my-2" />

		<div class="flex w-full gap-2">
			<Button variant="outline" size="icon">
				<CopyIcon />
			</Button>
			<Button variant="outline" size="icon">
				<ClipboardPasteIcon />
			</Button>
			<Button variant="outline" size="icon">
				<ScissorsIcon />
			</Button>
			<Button
				class="ml-auto"
				href={`/food-diary/add?day=${selectedDay?.toISOString().split('T')[0]}`}
			>
				<PlusIcon /> Add food
			</Button>
		</div>
	</Card.Content>
</Card.Root>

{#if !foodEntriesQuery.data}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<LoaderCircleIcon size={128} strokeWidth={1} class="animate-spin" />
		<span>Loading</span>
	</div>
{:else}
	{#each foodEntriesQuery.data as entry (entry.id)}
		<Card.Root class="py-4">
			<Card.Header class="px-4">
				<Card.Title>{entry.nutritionData?.product_name}</Card.Title>
				<Card.Description>
					{entry.quantity}g - {(
						entry.nutritionData!.energy_kcal_100g *
						(entry.quantity / 100)
					).toFixed()} calories
				</Card.Description>
				<Card.Action>
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
									onclick={() =>
										goto(`/food-diary/add/item?id=${entry.nutritionDataId}&edit=${entry.id}`)}
								>
									<PencilIcon /> Edit
								</DropdownMenu.Item>
								<DropdownMenu.Item class="text-red-500" onclick={() => deleteEntry(entry.id)}>
									<TrashIcon /> Delete
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Card.Action>
			</Card.Header>
		</Card.Root>
	{:else}
		<div class="h-full flex flex-col justify-center items-center gap-2 text-muted-foreground">
			<CalendarIcon size={128} strokeWidth={1} />
			<span>No food entries for this day</span>
		</div>
	{/each}
{/if}
