<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { exerciseSplit } from '../exerciseSplitStore';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import AddIcon from 'virtual:icons/material-symbols/add';
	import RemoveIcon from 'virtual:icons/material-symbols/remove';

	let splitName = $exerciseSplit.name;
	let splitDayNames = $exerciseSplit.splitDays.map((splitDay) => splitDay?.name ?? null);

	function changeDayStatus(idx: number) {
		splitDayNames[idx] = splitDayNames[idx] === null ? '' : null;
	}
</script>

<H2>New exercise split</H2>
<H3>Structure</H3>

<form on:submit|preventDefault class="flex h-px grow flex-col gap-2 overflow-y-auto mt-4">
	<div class="flex w-full max-w-sm flex-col gap-1.5">
		<Label for="splitName">Exercise split name</Label>
		<Input id="splitName" placeholder="Type here" bind:value={splitName} required />
	</div>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head></Table.Head>
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
							id="day-{i + 1}-is-rest"
							checked={splitDayName === null}
							on:click={() => changeDayStatus(i)}
						/>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class="my-1 grid grid-cols-2 gap-1">
		<Button variant="secondary"><RemoveIcon /></Button>
		<Button variant="secondary"><AddIcon /></Button>
		<Button class="col-span-2" type="submit">Next</Button>
	</div>
</form>
