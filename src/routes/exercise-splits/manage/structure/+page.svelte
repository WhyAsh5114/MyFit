<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import AddIcon from 'virtual:icons/lucide/plus';
	import RemoveIcon from 'virtual:icons/lucide/minus';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let dataLossDays: number[] = $state([]);
	let warningDialogOpen = $state(false);

	async function submitStructure(warningAcknowledged = false) {
		if (!exerciseSplitRunes.validateSplitStructure()) {
			toast.error('Workout names should be unique', {
				description: 'For example: Push A, Push B'
			});
			return;
		}
		dataLossDays = exerciseSplitRunes.getDataLossDays();
		if (!warningAcknowledged && dataLossDays.length > 0) {
			warningDialogOpen = true;
			return;
		}
		exerciseSplitRunes.updateSplitExercisesStructure();
		warningDialogOpen = false;
		await goto('./exercises');
	}
</script>

<H3>Structure</H3>
<form
	class="contents"
	id="exercise-split-structure-form"
	onsubmit={(e) => {
		e.preventDefault();
		submitStructure();
	}}
>
	<div class="mb-4 flex w-full flex-col gap-1.5">
		<Label for="exercise-split-name">Exercise split name</Label>
		<Input
			id="exercise-split-name"
			placeholder="Type here"
			required
			bind:value={exerciseSplitRunes.splitName}
		/>
	</div>
	<span class="mb-1.5 text-sm font-medium">Exercise split structure</span>
	<Table.Root>
		<Table.Header class="border-t">
			<Table.Row>
				<Table.Head></Table.Head>
				<Table.Head>Name</Table.Head>
				<Table.Head class="text-center">Rest</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each exerciseSplitRunes.splitDays as splitDay, dayNumber}
				<Table.Row>
					<Table.Cell>{dayNumber + 1}</Table.Cell>
					<Table.Cell>
						<Input
							id="exercise-split-day-{dayNumber + 1}-name"
							placeholder={splitDay.isRestDay ? 'Rest' : `Day ${dayNumber + 1}`}
							disabled={splitDay.isRestDay}
							required
							bind:value={splitDay.name}
						/>
					</Table.Cell>
					<Table.Cell class="p-0">
						<Checkbox
							checked={splitDay.isRestDay}
							onCheckedChange={(checked) => {
								if (checked === 'indeterminate') return;
								exerciseSplitRunes.toggleSplitDay(dayNumber, checked);
							}}
						/>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</form>

<div class="mb-1 mt-auto grid grid-cols-2 gap-1 pt-1">
	<Button
		variant="secondary"
		class="gap-2"
		onclick={exerciseSplitRunes.removeSplitDay}
		disabled={exerciseSplitRunes.splitDays.length === 1}
	>
		<RemoveIcon /> Remove
	</Button>
	<Button variant="secondary" class="gap-2" onclick={exerciseSplitRunes.addSplitDay}>
		<AddIcon /> Add
	</Button>
</div>
<Button type="submit" form="exercise-split-structure-form">Next</Button>

<ResponsiveDialog title="Warning" needTrigger={false} bind:open={warningDialogOpen}>
	<p>
		You'll lose exercise data from the following days:
		<span class="font-semibold text-yellow-500">
			{dataLossDays.map((day) => `Day ${day + 1}`).join(', ')}
		</span>. Continue?
	</p>
	<Button variant="destructive" onclick={() => submitStructure(true)}>Continue</Button>
</ResponsiveDialog>
