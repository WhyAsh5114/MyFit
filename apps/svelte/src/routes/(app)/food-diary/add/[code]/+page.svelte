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
	import { CalendarIcon, PlusIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import FoodDataCard from './_components/food-data-card.svelte';
	import { client } from '$lib/idb-client';
	import { goto } from '$app/navigation';

	const df = new DateFormatter('en-US', { dateStyle: 'long' });

	let dateValue = $state<DateValue>(parseDate(page.url.searchParams.get('day') ?? ''));
	let timeValue = $state(
		new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
	);
	let userQuantity = $state(100);

	const foodQuery = createQuery({
		queryKey: ['food', page.params.code],
		queryFn: async () => {
			try {
				const response = await fetch(`/api/food/${page.params.code}`);
				if (!response.ok) throw new Error('Error occurred while fetching food data');
				return (await response.json()) as Omit<NutritionData, 'code'> & { code: string };
			} catch (error) {
				toast.error('Error fetching food data');
				console.error('Error fetching food data:', error);
				throw error;
			}
		}
	});

	async function logFoodEntry(e: SubmitEvent) {
		e.preventDefault();
		if (!dateValue || !timeValue || userQuantity <= 0 || !$foodQuery.data) {
			return toast.error('Please fill in all fields correctly.');
		}

		const localDateTime = new Date(`${dateValue.toString()}T${timeValue}:00`);
		const eatenAt = new Date(localDateTime.getTime() - localDateTime.getTimezoneOffset() * 60000);

		try {
			const user = await client.user.findFirstOrThrow();
			const existingData = await client.nutritionData.findUnique({
				where: { code: page.params.code },
				select: { code: true }
			});
			if (!existingData) {
				await client.nutritionData.create({
					data: { ...$foodQuery.data, code: page.params.code }
				});
			}

			await client.foodEntry.create({
				data: {
					eatenAt,
					quantity: userQuantity,
					userId: user.id,
					nutritionDataCode: page.params.code
				}
			});
			toast.success('Food entry logged successfully!');
			goto(`/food-diary?day=${eatenAt.toISOString().split('T')[0]}`);
		} catch (error) {
			console.error('Error logging food entry:', error);
		}
	}
</script>

<H2 class="flex items-center justify-between">
	Add food
	<Badge variant="secondary">
		Code: {page.params.code}
	</Badge>
</H2>

{#if $foodQuery.isLoading}
	<Skeleton class="h-[270px] w-full" />
{:else if $foodQuery.isError}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<span>Error loading food data</span>
	</div>
{:else if $foodQuery.data}
	<div class="flex flex-col gap-4">
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

<Button class="mt-auto" type="submit" form="food-entry-form">
	<PlusIcon /> Add food
</Button>
