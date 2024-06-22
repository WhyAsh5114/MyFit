<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import * as Table from '$lib/components/ui/table';
	import type { MesocycleCyclicSetChange } from '@prisma/client';

	type PropsType = { cyclicSetChanges: MesocycleCyclicSetChange[] };
	let { cyclicSetChanges }: PropsType = $props();
</script>

<ScrollArea orientation="both" class="h-px grow">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Muscle group</Table.Head>
				<Table.Head>Max volume</Table.Head>
				<Table.Head>Set increase amount</Table.Head>
				<Table.Head>Regardless of progress</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each cyclicSetChanges as setChange}
				<Table.Row>
					<Table.Cell class="font-medium">
						{setChange.customMuscleGroup ?? setChange.muscleGroup}
					</Table.Cell>
					<Table.Cell>{setChange.maxVolume}</Table.Cell>
					<Table.Cell>{setChange.setIncreaseAmount}</Table.Cell>
					<Table.Cell>
						<Checkbox
							id="{setChange.customMuscleGroup ??
								setChange.muscleGroup}-increase-volume-regardless-of-progress"
							checked={setChange.regardlessOfProgress}
							disabled
						/>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</ScrollArea>
