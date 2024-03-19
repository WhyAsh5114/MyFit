<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { exerciseSplitStore } from '../exerciseSplitStore';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import AddIcon from 'virtual:icons/material-symbols/add';
	import RemoveIcon from 'virtual:icons/material-symbols/remove';
	import { goto } from '$app/navigation';

	let splitName = $exerciseSplitStore.name;
	let splitDayNames = $exerciseSplitStore.splitDays.map((splitDay) => splitDay?.name ?? null);

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

	function submitStructure() {
		$exerciseSplitStore.name = splitName;
		$exerciseSplitStore.splitDays = splitDayNames.map((splitDay) => {
			if (splitDay === null) {
				return splitDay;
			}
			return { name: splitDay, exerciseTemplates: [] };
		});
		goto('/exercise-splits/new/exercises');
	}
</script>

<H2>New exercise split</H2>
<H3>Structure</H3>

<form
	on:submit|preventDefault={submitStructure}
	class="mt-4 flex h-px grow flex-col gap-2 overflow-y-auto"
>
	<div class="flex w-full max-w-sm flex-col gap-1.5 px-1">
		<Label for="splitName">Exercise split name</Label>
		<Input id="splitName" placeholder="Type here" bind:value={splitName} required />
	</div>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-12"></Table.Head>
				<Table.Head class="text-foreground">Name</Table.Head>
				<Table.Head class="text-foreground">Rest</Table.Head>
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
	<div class="my-1 mt-auto grid grid-cols-2 gap-1">
		<Button
			variant="secondary"
			aria-label="remove workout day"
			on:click={removeDay}
			disabled={splitDayNames.length === 1}
		>
			<RemoveIcon />
		</Button>
		<Button variant="secondary" aria-label="add workout day" on:click={addDay}>
			<AddIcon />
		</Button>
		<Button class="col-span-2" type="submit">Next</Button>
	</div>
</form>
