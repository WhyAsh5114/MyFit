<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { exerciseSplitStore } from '../exerciseSplitStore';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { toast } from 'svelte-sonner';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import AddIcon from 'virtual:icons/material-symbols/add';
	import RemoveIcon from 'virtual:icons/material-symbols/remove';
	import { goto } from '$app/navigation';

	let splitName = $exerciseSplitStore.name;
	let splitDayNames = $exerciseSplitStore.splitDays.map((splitDay) => splitDay?.name ?? null);
	let warningDrawerOpen = false;
	let missingDays: string[] = [];

	function changeDayStatus(idx: number) {
		splitDayNames[idx] = splitDayNames[idx] === null ? '' : null;
	}

	function addDay() {
		splitDayNames = [...splitDayNames, ''];
	}

	function removeDay() {
		splitDayNames.pop();
		splitDayNames = splitDayNames;
	}

	function validateStructure() {
		if (splitDayNames.filter((splitDay) => splitDay !== null).length === 0) {
			toast.error('Error', { description: 'Add at least one workout to the microcycle' });
			return false;
		}

		const nonRestDays = splitDayNames.filter((splitDay) => splitDay !== null);
		if (new Set(nonRestDays).size < nonRestDays.length) {
			toast.error('Error', {
				description:
					'Workouts names should be unique. For example: Push A, Push B instead of Push, Push'
			});
			return false;
		}
		return true;
	}

	function checkAndWarnMissing() {
		const oldSplitDays = structuredClone($exerciseSplitStore.splitDays);
		const oldSplitDayNames = oldSplitDays
			.filter((splitDay) => splitDay !== null && splitDay.exerciseTemplates.length > 0)
			.map((splitDay) => splitDay?.name ?? null);

		missingDays = oldSplitDayNames.filter(
			(item) => !splitDayNames.includes(item) && item !== null
		) as string[];
		if (missingDays.length > 0) {
			warningDrawerOpen = true;
			return true;
		}
		return false;
	}

	function submitStructure(force = false) {
		if (!validateStructure()) return;
		if (!force && checkAndWarnMissing()) {
			return;
		}

		const oldSplitDays = structuredClone($exerciseSplitStore.splitDays);
		$exerciseSplitStore.name = splitName;
		$exerciseSplitStore.splitDays = splitDayNames.map((splitDay) => {
			if (splitDay === null) return splitDay;
			const matchedSplitDay = oldSplitDays.find((oldSplitDay) => {
				return oldSplitDay?.name === splitDay;
			});
			return { name: splitDay, exerciseTemplates: matchedSplitDay?.exerciseTemplates ?? [] };
		});
		goto(`./exercises`);
	}
</script>

<H3>Structure</H3>

<form on:submit|preventDefault={() => submitStructure()} class="mt-4 flex h-px grow flex-col gap-2">
	<div class="flex w-full flex-col gap-1.5 px-1">
		<Label for="splitName">Exercise split name</Label>
		<Input id="splitName" placeholder="Type here" bind:value={splitName} required />
	</div>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-12"></Table.Head>
				<Table.Head class="text-foreground">Name</Table.Head>
				<Table.Head class="text-center text-foreground">Rest</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each splitDayNames as splitDayName, i}
				<Table.Row>
					<Table.Cell class="text-right text-muted-foreground">{i + 1}</Table.Cell>
					<Table.Cell>
						<Input
							id="day-{i + 1}-name"
							placeholder={splitDayName === null ? 'Rest day' : `Day ${i + 1} name`}
							bind:value={splitDayNames[i]}
							disabled={splitDayName === null}
							required={splitDayName !== null}
						/>
					</Table.Cell>
					<Table.Cell class="px-0 text-center">
						<Checkbox
							aria-label="day-{i + 1}-is-rest"
							id="day-{i + 1}-is-rest"
							checked={splitDayName === null}
							on:click={() => changeDayStatus(i)}
						/>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class="mt-auto grid grid-cols-2 gap-1">
		<Button
			variant="secondary"
			class="gap-2"
			on:click={removeDay}
			disabled={splitDayNames.length === 1}
		>
			<RemoveIcon /> Remove
		</Button>
		<Button variant="secondary" class="gap-2" on:click={addDay}>
			<AddIcon /> Add
		</Button>
		<Button class="col-span-2" type="submit">Next</Button>
	</div>
</form>

<ResponsiveDialog
	title="Warning"
	needTrigger={false}
	bind:open={warningDrawerOpen}
	cancelVariant="default"
>
	<p>
		You will lose exercise data for the following workout days:
		<span class="font-semibold text-red-500">{missingDays.join(', ')}</span>
	</p>
	<Button variant="destructive" on:click={() => submitStructure(true)}>Ok, proceed</Button>
</ResponsiveDialog>
