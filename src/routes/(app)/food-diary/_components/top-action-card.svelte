<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { MacroMetrics, MacroTargets } from '$lib/generated/prisma/client';
	import { formatDateToISO } from '$lib/my-utils';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		ClipboardPasteIcon,
		CopyIcon,
		EqualIcon,
		LoaderCircleIcon,
		MinusIcon,
		PlusIcon,
		ScissorsIcon
	} from '@lucide/svelte';
	import { SvelteDate } from 'svelte/reactivity';

	type PropsType = {
		selectedDay: SvelteDate | undefined;
		macroData:
			| {
					caloricTarget: number;
					metrics: MacroMetrics;
					targets: MacroTargets;
			  }
			| undefined
			| null;
		caloricIntake: number;
		caloricExpenditure: number;
	};
	let { selectedDay, macroData, caloricExpenditure, caloricIntake }: PropsType = $props();

	function changeDay(direction: 'prev' | 'next') {
		if (!selectedDay) return;

		const newDate = new SvelteDate(selectedDay);
		if (direction === 'prev') {
			newDate.setDate(newDate.getDate() - 1);
		} else {
			newDate.setDate(newDate.getDate() + 1);
		}
		selectedDay = newDate;

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/food-diary?day=${formatDateToISO(newDate).split('T')[0]}`);
	}
</script>

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
		<Progress value={caloricIntake} max={macroData?.caloricTarget ?? Infinity} class="h-2" />
		<div
			class="text-muted-foreground flex h-4 w-full items-center justify-between text-sm font-medium"
		>
			{#if macroData}
				<p>{macroData.caloricTarget?.toFixed()}</p>
				<MinusIcon size={16} />

				<p>{caloricIntake.toFixed()}</p>
				<PlusIcon size={16} />

				<p>{caloricExpenditure.toFixed()}</p>
				<EqualIcon size={16} />

				<p>{(macroData.caloricTarget - caloricIntake).toFixed()}</p>
			{:else if macroData === null}
				<p class="w-full text-center">
					Goals haven't been setup.
					<a href={resolve('/food-diary/goals')} class="underline">Set up now!</a>
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
				href={`/food-diary/add?day=${selectedDay ? formatDateToISO(selectedDay).split('T')[0] : ''}`}
			>
				<PlusIcon /> Add food
			</Button>
		</div>
	</Card.Content>
</Card.Root>
