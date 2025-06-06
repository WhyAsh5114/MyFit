<script lang="ts">
	import { page } from '$app/state';
	import H2 from '$lib/components/typography/h2.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { cn } from '$lib/utils';
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		parseDate
	} from '@internationalized/date';
	import type { NutritionData } from '@prisma/client';
	import { createQuery } from '@tanstack/svelte-query';
	import { CalendarIcon, LoaderCircleIcon, PencilIcon, PlusIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import FoodDataCard from './_components/food-data-card.svelte';
	import { client } from '$lib/idb-client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const df = new DateFormatter('en-US', { dateStyle: 'long' });

	let itemCode = $state<string | null>();
	let editingFoodEntryId = $state<string | null>();

	let dateValue = $state<DateValue>(parseDate(new Date().toISOString().split('T')[0]));
	let timeValue = $state(
		new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
	);
	let userQuantity = $state(100);

	$effect(() => {
		itemCode = page.url.searchParams.get('code');
		if (itemCode === null) {
			toast.error('Food code is required.');
			return;
		}

		editingFoodEntryId = page.url.searchParams.get('edit');
		if (editingFoodEntryId) loadEditEntry(editingFoodEntryId);

		const selectedDay = page.url.searchParams.get('day');
		if (selectedDay) dateValue = parseDate(selectedDay);
	});

	async function loadEditEntry(entryId: string) {
		const entry = await client.foodEntry.findUnique({
			where: { id: entryId }
		});
		if (!entry) return;

		dateValue = parseDate(entry.eatenAt.toISOString().split('T')[0]);
		timeValue = entry.eatenAt.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
		userQuantity = entry.quantity;
	}

	let foodQuery = $state<ReturnType<typeof createQuery<NutritionData>>>();
	onMount(() => {
		foodQuery = createQuery({
			queryKey: ['food', page.url.searchParams.get('code')],
			queryFn: async () => {
				try {
					const response = await fetch(`/api/food/${page.url.searchParams.get('code')}`);
					if (!response.ok) throw new Error('Error occurred while fetching food data');
					return (await response.json()) as NutritionData;
				} catch (error) {
					toast.error('Error fetching food data');
					console.error('Error fetching food data:', error);
					throw error;
				}
			}
		});
	});

	async function logFoodEntry(e: SubmitEvent) {
		e.preventDefault();
		if (!itemCode || !dateValue || !timeValue || userQuantity <= 0 || !$foodQuery?.data) {
			return toast.error('Please fill in all fields correctly.');
		}

		const eatenAt = new Date(`${dateValue.toString()}T${timeValue}:00`);
		try {
			const user = await client.user.findFirstOrThrow();
			const existingData = await client.nutritionData.findUnique({
				where: { code: itemCode },
				select: { code: true }
			});
			if (!existingData) {
				await client.nutritionData.create({
					data: { ...$foodQuery.data, code: itemCode }
				});
			}

			if (editingFoodEntryId) {
				await client.foodEntry.update({
					where: { id: editingFoodEntryId },
					data: {
						eatenAt,
						quantity: userQuantity,
						userId: user.id,
						nutritionDataCode: itemCode
					}
				});
				toast.success('Food entry updated successfully!');
			} else {
				await client.foodEntry.create({
					data: {
						eatenAt,
						quantity: userQuantity,
						userId: user.id,
						nutritionDataCode: itemCode
					}
				});
				toast.success('Food entry logged successfully!');
			}
			goto(`/food-diary?day=${eatenAt.toISOString().split('T')[0]}`);
		} catch (error) {
			console.error('Error logging food entry:', error);
		}
	}
</script>

<H2 class="flex items-center justify-between">
	Add food
	<Badge variant="secondary">
		Code: {itemCode}
	</Badge>
</H2>

{#if $foodQuery === undefined || $foodQuery.isLoading}
	<Skeleton class="h-48 w-full" />
{:else if $foodQuery.isError}
	<div class="text-muted-foreground flex h-48 flex-col items-center justify-center gap-2">
		<span>Error loading food data</span>
	</div>
{:else if $foodQuery.data}
	<div class="flex h-48 w-full flex-col items-center gap-4">
		<FoodDataCard {...$foodQuery.data} {userQuantity} />
	</div>
{/if}

<form
	class="bg-card grid grid-cols-2 gap-x-2 gap-y-4 rounded-md border p-4"
	onsubmit={logFoodEntry}
	name="food-entry-form"
	id="food-entry-form"
>
	<Label class="col-span-full flex flex-col gap-2">
		Quantity (in grams)
		<Input
			type="number"
			min="0"
			step="0.01"
			bind:value={userQuantity}
			class="w-full"
			placeholder="Enter quantity in grams"
		/>
	</Label>

	<Label class="flex flex-col gap-2">
		Date
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button
						variant="outline"
						class={cn(
							'w-full justify-start text-left font-normal',
							!dateValue && 'text-muted-foreground'
						)}
						{...props}
					>
						<CalendarIcon class="size-4" />
						<span class="truncate">
							{dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : 'Select a date'}
						</span>
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0">
				<Calendar bind:value={dateValue} type="single" initialFocus />
			</Popover.Content>
		</Popover.Root>
	</Label>

	<Label class="flex flex-col gap-2">
		Time
		<Input type="time" bind:value={timeValue} />
	</Label>
</form>

<Button
	class="mt-auto"
	type="submit"
	form="food-entry-form"
	disabled={$foodQuery === undefined || $foodQuery.isLoading}
>
	{#if editingFoodEntryId}
		<PencilIcon /> Edit food
	{:else if editingFoodEntryId === null}
		<PlusIcon /> Add food
	{:else}
		<LoaderCircleIcon class="animate-spin" />
	{/if}
</Button>
