<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import H2 from '$lib/components/typography/h2.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { client } from '$lib/idb-client';
	import { cn } from '$lib/utils';
	import {
		type DateValue,
		DateFormatter,
		fromDate,
		getLocalTimeZone,
		parseDate,
		Time,
		toCalendarDate,
		toCalendarDateTime,
		today
	} from '@internationalized/date';
	import { CalendarIcon, LoaderCircleIcon, PencilIcon, PlusIcon } from '@lucide/svelte';
	import type { NutritionData } from '$lib/generated/prisma/client';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { getFoodById } from '../../food.remote';
	import FoodDataCard from './_components/food-data-card.svelte';

	const df = new DateFormatter('en-US', { dateStyle: 'long' });

	const now = new Date();
	let itemId = $state<number | null>();
	let editingFoodEntryId = $state<string | null>();

	let dateValue = $state<DateValue>(today(getLocalTimeZone()));
	let timeValue = $state(new Time(now.getHours(), now.getMinutes()).toString().slice(0, 5));
	let userQuantity = $state(100);

	$effect(() => {
		const itemIdValue = page.url.searchParams.get('id');
		if (itemIdValue === null) {
			toast.error('Food code is required.');
			return;
		}
		itemId = Number(itemIdValue);

		const selectedDay = page.url.searchParams.get('day');
		if (selectedDay) dateValue = parseDate(selectedDay);

		editingFoodEntryId = page.url.searchParams.get('edit');
	});

	const editEntryQuery = createQuery(() => ({
		queryKey: ['foodEntry', editingFoodEntryId],
		queryFn: async () => {
			if (!editingFoodEntryId) return null;
			return await client.foodEntry.findUnique({
				where: { id: editingFoodEntryId }
			});
		},
		enabled: Boolean(editingFoodEntryId)
	}));

	$effect(() => {
		if (editEntryQuery.data) {
			const entry = editEntryQuery.data;
			const eatenAt = entry.eatenAt;
			const zoned = fromDate(eatenAt, getLocalTimeZone());
			dateValue = toCalendarDate(zoned);
			timeValue = new Time(eatenAt.getHours(), eatenAt.getMinutes()).toString();
			userQuantity = entry.quantity;
		}
	});

	const foodQuery = createQuery(() => ({
		queryKey: ['food', itemId],
		queryFn: () => getFoodById({ id: itemId! }),
		enabled: Boolean(itemId),
		throwOnError: (error) => {
			toast.error('Error fetching food data');
			console.error('Error fetching food data:', error);
			return false;
		}
	}));

	const foodEntryMutation = createMutation(() => ({
		mutationFn: async (data: {
			eatenAt: Date;
			quantity: number;
			itemId: number;
			nutritionData: NutritionData;
			editingId?: string;
		}) => {
			const user = await client.user.findFirstOrThrow();

			// Ensure nutrition data exists
			const existingData = await client.nutritionData.findUnique({
				where: { id: data.itemId },
				select: { id: true }
			});
			if (!existingData) {
				await client.nutritionData.create({
					data: { ...data.nutritionData, id: data.itemId }
				});
			}

			// Common data for both create and update
			const entryData = {
				eatenAt: data.eatenAt,
				quantity: data.quantity,
				userId: user.id,
				nutritionDataId: data.itemId
			};

			// Create or update food entry using upsert
			return await client.foodEntry.upsert({
				where: { id: data.editingId },
				update: entryData,
				create: entryData
			});
		},
		onSuccess: (data, variables) => {
			const message = variables.editingId
				? 'Food entry updated successfully!'
				: 'Food entry logged successfully!';
			toast.success(message);

			const calEatenAt = fromDate(variables.eatenAt, getLocalTimeZone());
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`/food-diary?day=${calEatenAt.toString().split('T')[0]}`);
		},
		onError: (error) => {
			console.error('Error logging food entry:', error);
			toast.error('Failed to save food entry. Please try again.');
		}
	}));

	async function logFoodEntry(e: SubmitEvent) {
		e.preventDefault();
		if (!itemId || !dateValue || !timeValue || userQuantity <= 0 || !foodQuery.data) {
			return toast.error('Please fill in all fields correctly.');
		}

		const [hours, minutes] = timeValue.split(':').map(Number);
		const time = new Time(hours, minutes);

		const dateTime = toCalendarDateTime(dateValue, time);
		const eatenAt = dateTime.toDate(getLocalTimeZone());

		foodEntryMutation.mutate({
			eatenAt,
			quantity: userQuantity,
			itemId,
			nutritionData: foodQuery.data,
			editingId: editingFoodEntryId || undefined
		});
	}
</script>

<H2 class="flex items-center justify-between">
	Add food
	<Badge variant="secondary">
		Code: {foodQuery.data?.code || 'N/A'}
	</Badge>
</H2>

{#if foodQuery.isLoading}
	<Skeleton class="h-48 w-full" />
{:else if foodQuery.isError}
	<div
		class="text-muted-foreground flex h-48 flex-col items-center justify-center gap-2 rounded-md border"
	>
		<span>Error loading food data</span>
		<span class="text-sm">{foodQuery.error?.message}</span>
	</div>
{:else if foodQuery.data}
	<div class="flex h-48 w-full flex-col items-center gap-4">
		<FoodDataCard {...foodQuery.data} {userQuantity} />
	</div>
{/if}

<Card.Root class="py-4">
	<Card.Content class="px-4">
		<form
			class="bg-card grid grid-cols-2 gap-x-2 gap-y-4"
			onsubmit={logFoodEntry}
			name="food-entry-form"
			id="food-entry-form"
		>
			<Label class="col-span-2 flex flex-col items-start gap-2">
				Date
				<Popover.Root>
					<Popover.Trigger class="w-full">
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

			<Label class="flex flex-col items-start gap-2">
				Quantity (g)
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
				Time
				<Input type="time" bind:value={timeValue} />
			</Label>
		</form>
	</Card.Content>
</Card.Root>

<Button
	class="mt-auto"
	type="submit"
	form="food-entry-form"
	disabled={foodQuery.isLoading || foodQuery.isError || foodEntryMutation.isPending}
>
	{#if foodEntryMutation.isPending}
		<LoaderCircleIcon class="animate-spin" /> Saving...
	{:else if editingFoodEntryId}
		<PencilIcon /> Edit food
	{:else}
		<PlusIcon /> Add food
	{/if}
</Button>
