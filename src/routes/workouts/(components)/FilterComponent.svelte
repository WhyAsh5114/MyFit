<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { dateToCalendarDate } from '$lib/utils';
	import type { DateRange, Selected } from 'bits-ui';
	import FilterIcon from 'virtual:icons/lucide/filter';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Label from '$lib/components/ui/label/label.svelte';
	import DateRangePicker from './DateRangePicker.svelte';
	import type { WorkoutStatus } from '@prisma/client';

	let { workouts }: { workouts: RouterOutputs['workouts']['load'] } = $props();
	let firstWorkoutDate = $derived(dateToCalendarDate(workouts[0].startedAt));
	let lastWorkoutDate = $derived(dateToCalendarDate(workouts.at(-1)!.startedAt));

	let selectedDateRange: DateRange = $state({ start: dateToCalendarDate(workouts[0].startedAt), end: undefined });
	let selectedMesocycles: Selected<string>[] = $state([]);

	let selectedworkoutStatus: Map<WorkoutStatus | null, boolean> = new Map();
	selectedworkoutStatus.set(null, true);
	selectedworkoutStatus.set('Skipped', true);
	selectedworkoutStatus.set('RestDay', true);
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button class="grow gap-2" aria-label="search" builders={[builder]} variant="secondary">
			Filters <FilterIcon />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="flex w-11/12 max-w-xl flex-col gap-1">
		<span class="text-sm font-semibold">Date range</span>
		<DateRangePicker bind:value={selectedDateRange} {firstWorkoutDate} {lastWorkoutDate} />

		<span class="mt-2 text-sm font-semibold">Mesocycles</span>
		<Select.Root multiple bind:selected={selectedMesocycles}>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="Select a value" />
			</Select.Trigger>
			<Select.Content>
				{#each Object.keys(Object.groupBy(workouts, ({ workoutOfMesocycle }) => workoutOfMesocycle?.mesocycle.name ?? '')) as mesocycleName}
					{#if mesocycleName !== ''}
						<Select.Item value={mesocycleName}>{mesocycleName}</Select.Item>
					{:else}
						<Select.Item class="italic" value={null}>Non-meso workouts</Select.Item>
					{/if}
				{/each}
			</Select.Content>
		</Select.Root>

		<span class="mt-2 text-sm font-semibold">Workout types</span>
		<div class="flex justify-between rounded-md border p-3">
			{#each selectedworkoutStatus as [workoutStatus, selected]}
				<div class="flex items-center gap-2">
					<Label for="{workoutStatus}-workout-status" class="text-sm leading-none">
						{#if workoutStatus}
							{workoutStatus}
						{:else}
							Normal
						{/if}
					</Label>
					<Checkbox
						id="{workoutStatus}-workout-status"
						checked={selected}
						onCheckedChange={(c) => {
							if (typeof c === 'string') return;
							selectedworkoutStatus.set(workoutStatus, c);
						}}
					/>
				</div>
			{/each}
		</div>
		<Button class="mt-2">Apply</Button>
	</Popover.Content>
</Popover.Root>
