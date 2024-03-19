<script lang="ts">
	import { muscleGroups, setTypes } from '$lib/arrays';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Sheet from '$lib/components/ui/sheet';
	import AddIcon from 'virtual:icons/material-symbols/add';
</script>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" aria-label="add exercise" size="icon">
			<AddIcon />
		</Button>
	</Sheet.Trigger>
	<Sheet.Content class="w-11/12">
		<Sheet.Header>
			<Sheet.Title>Add exercise</Sheet.Title>
		</Sheet.Header>
		<form on:submit|preventDefault class="grid h-fit grid-cols-2 gap-x-2 gap-y-4 mt-8">
			<div class="col-span-2 flex w-full flex-col gap-1.5">
				<Label for="exercise-name">Exercise name</Label>
				<Input id="exercise-name" placeholder="Type here" />
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Select.Root name="exercise-target-muscle-group">
					<Select.Label class="p-0 text-sm font-medium leading-none">
						Target muscle group
					</Select.Label>
					<Select.Trigger>
						<Select.Value placeholder="Pick one" />
					</Select.Trigger>
					<Select.Content>
						<ScrollArea class="h-64">
							{#each muscleGroups as muscleGroup}
								<Select.Item value={muscleGroup} label={muscleGroup} />
							{/each}
						</ScrollArea>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-involves-bodyweight">Involves bodyweight</Label>
				<div class="flex items-center rounded-md border px-2 py-1.5">
					<Switch
						includeInput
						id="exercise-involves-bodyweight"
						name="exercise-involves-bodyweight"
					/>
				</div>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-sets">Sets</Label>
				<Input type="number" min={1} id="exercise-sets" placeholder="Type here" />
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Select.Root name="exercise-set-type">
					<Select.Label class="p-0 text-sm font-medium leading-none">Set type</Select.Label>
					<Select.Trigger>
						<Select.Value class="capitalize" placeholder="Pick one" />
					</Select.Trigger>
					<Select.Content>
						{#each setTypes as setType}
							<Select.Item class="capitalize" value={setType} label={setType} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-rep-range-start">Rep range start</Label>
				<Input id="exercise-rep-range-start" min={1} type="number" placeholder="Type here" />
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-rep-range-end">Rep range end</Label>
				<Input id="exercise-rep-range-end" type="number" placeholder="Type here" />
			</div>
			<div class="col-span-2 flex w-full flex-col gap-1.5">
				<Label for="exercise-note">Note</Label>
				<Textarea
					id="exercise-note"
					placeholder="Exercise cues, machine heights, etc."
					class="resize-none"
				/>
			</div>
			<Button type="submit" class="col-span-2">Add exercise</Button>
		</form>
	</Sheet.Content>
</Sheet.Root>
