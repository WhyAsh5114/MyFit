<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import type { WorkoutStatus } from '@prisma/client';
	import type { DateRange, Selected } from 'bits-ui';
	import FilterIcon from 'virtual:icons/lucide/filter';
	import DateRangePicker from './DateRangePicker.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { onMount } from 'svelte';
	import { dateToCalendarDate } from '$lib/utils';

	type PropsType = {
		currentFilters: Exclude<RouterInputs['workouts']['load']['filters'], undefined>;
		filterData: NonNullable<RouterOutputs['workouts']['getFilterData']>;
		setFilters: (
			selectedDateRange: DateRange,
			selectedMesocycles: (string | null)[],
			selectedWorkoutStatus: (WorkoutStatus | null)[]
		) => void;
	};
	let { currentFilters, filterData, setFilters }: PropsType = $props();

	let open = $state(false);
	let selectedDateRange: DateRange = $state({ start: undefined, end: undefined });
	let selectedMesocycles: Selected<string | null>[] = $state([]);
	let selectedWorkoutStatuses: Map<WorkoutStatus | null, boolean> = new Map([
		[null, true],
		['Skipped', true],
		['RestDay', true]
	]);

	onMount(() => {
		if (currentFilters.startDate) {
			selectedDateRange.start = dateToCalendarDate(new Date(currentFilters.startDate));
		}
		if (currentFilters.endDate) {
			selectedDateRange.end = dateToCalendarDate(new Date(currentFilters.endDate));
		}
		if (currentFilters.selectedMesocycles) {
			selectedMesocycles = currentFilters.selectedMesocycles.map((mesocycleName) => ({
				value: mesocycleName,
				label: mesocycleName ?? 'Non-meso workouts'
			}));
		}
		if (currentFilters.selectedWorkoutStatuses) {
			selectedWorkoutStatuses.set(null, false);
			selectedWorkoutStatuses.set('Skipped', false);
			selectedWorkoutStatuses.set('RestDay', false);
			currentFilters.selectedWorkoutStatuses.forEach((workoutStatus) => {
				selectedWorkoutStatuses.set(workoutStatus, true);
			});
		}
	});

	function applyFilters() {
		setFilters(
			selectedDateRange,
			selectedMesocycles.map((s) => s.value),
			Array.from(selectedWorkoutStatuses.entries())
				.filter(([_, value]) => value)
				.map(([key]) => key)
		);
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button class="grow gap-2" aria-label="search" builders={[builder]} variant="secondary">
			Filters <FilterIcon />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="flex w-11/12 max-w-xl flex-col gap-1">
		<span class="text-sm font-semibold">Date range</span>
		<DateRangePicker bind:value={selectedDateRange} {...filterData} />

		<span class="mt-2 text-sm font-semibold">Mesocycles</span>
		<Select.Root multiple bind:selected={selectedMesocycles}>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="Select a value" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item class="italic" value={null}>Non-meso workouts</Select.Item>
				{#each filterData.allMesocycles as mesocycle}
					{@const isActive = mesocycle.startDate && mesocycle.endDate === null}
					<Select.Item class="flex items-center justify-between" value={mesocycle.name}>
						{mesocycle.name}
						{#if isActive}
							<Badge>Active</Badge>
						{/if}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<span class="mt-2 text-sm font-semibold">Workout types</span>
		<div class="flex justify-between rounded-md border p-3">
			{#each selectedWorkoutStatuses as [workoutStatus, selected]}
				<div class="flex items-center gap-2">
					<Label for="{workoutStatus}-workout-status" class="text-sm leading-none">
						{workoutStatus ?? 'Normal'}
					</Label>
					<Checkbox
						id="{workoutStatus}-workout-status"
						checked={selected}
						onCheckedChange={(c) => {
							if (typeof c === 'string') return;
							selectedWorkoutStatuses.set(workoutStatus, c);
						}}
					/>
				</div>
			{/each}
		</div>
		<Button class="mt-2" onclick={applyFilters}>Apply</Button>
	</Popover.Content>
</Popover.Root>
