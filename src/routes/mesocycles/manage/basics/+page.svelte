<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Resizable from '$lib/components/ui/resizable';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';

	import { mesocycleRunes } from '../mesocycleRunes.svelte';
	import type { PaneAPI } from 'paneforge';
	import { arraySum } from '$lib/utils';
	import type { Selected } from 'bits-ui';
	import { goto } from '$app/navigation';

	let manualDragging = false;
	let panes: PaneAPI[] = [];

	let RIRProgression = $state(
		structuredClone($state.snapshot(mesocycleRunes.mesocycle.RIRProgression))
	);
	let totalDuration = $state(arraySum(mesocycleRunes.mesocycle.RIRProgression));
	let selectedRIR: Selected<number> = $derived({
		value: RIRProgression.length - 1,
		label: `${RIRProgression.length - 1} RIR`
	});

	function generateRIRDistribution(startingRir: number, totalWeeks: number) {
		if (startingRir === 0) {
			RIRProgression = [totalWeeks];
			return;
		}
		const rirDistribution: number[] = Array(startingRir + 1).fill(0);
		rirDistribution[0] = 1;
		let remainingWeeks = totalWeeks - 1;
		while (remainingWeeks > 0) {
			for (let rir = 1; rir <= startingRir; rir++) {
				if (remainingWeeks > 0) {
					rirDistribution[rir] += 1;
					remainingWeeks -= 1;
				}
			}
		}
		RIRProgression = rirDistribution;
	}

	function saveBasics() {
		mesocycleRunes.mesocycle.RIRProgression = RIRProgression;
		mesocycleRunes.saveStoresToLocalStorage();
		goto('/mesocycles/manage/exercise-split');
	}
</script>

<H3>Basics</H3>

<form class="flex grow flex-col gap-2" onsubmit={saveBasics}>
	<div class="flex w-full flex-col gap-1.5">
		<Label for="mesocycle-name">Mesocycle name</Label>
		<Input
			id="mesocycle-name"
			placeholder="Type here"
			required
			bind:value={mesocycleRunes.mesocycle.name}
		/>
	</div>

	<div class="flex gap-2">
		<div class="flex basis-1/2 flex-col gap-1.5">
			<Select.Root
				required
				selected={selectedRIR}
				onSelectedChange={(s) => {
					if (!s) return;
					generateRIRDistribution(s.value, totalDuration);
				}}
			>
				<Select.Label class="p-0 text-sm font-medium leading-none">Start RIR</Select.Label>
				<Select.Trigger>
					<Select.Value placeholder="Pick one" />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value={4}>4 RIR</Select.Item>
						<Select.Item value={3}>3 RIR</Select.Item>
						<Select.Item value={2}>2 RIR</Select.Item>
						<Select.Item value={1}>1 RIR</Select.Item>
						<Select.Item value={0}>0 RIR</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex basis-1/2 flex-col gap-1.5">
			<Label for="mesocycle-duration">Mesocycle duration</Label>
			<Input
				id="mesocycle-duration"
				placeholder="Type here"
				type="number"
				min={selectedRIR.value + 1}
				max={20}
				required
				value={totalDuration}
				oninput={(e) => {
					totalDuration = e.currentTarget.valueAsNumber;
					if (!isNaN(totalDuration)) generateRIRDistribution(selectedRIR.value, totalDuration);
				}}
			/>
		</div>
	</div>

	<span class="text-sm font-medium leading-none">RIR progression</span>
	<Resizable.PaneGroup direction="vertical" class="rounded-lg border">
		{#key (selectedRIR.value, totalDuration)}
			{#each RIRProgression.toReversed() as cyclesPerRIR, idx}
				<Resizable.Pane
					defaultSize={(100 / totalDuration) * cyclesPerRIR}
					minSize={100 / totalDuration}
					onResize={(size) => {
						if (!manualDragging) return;
						RIRProgression[selectedRIR.value - idx] = Math.round((size / 100) * totalDuration);
					}}
					bind:pane={panes[idx]}
				>
					<div class="flex h-full items-center justify-between px-4">
						<span class="text-center font-semibold">{selectedRIR.value - idx} RIR</span>
						<span class="text-center text-sm text-muted-foreground">{cyclesPerRIR} cycles</span>
					</div>
				</Resizable.Pane>
				{#if idx !== RIRProgression.length - 1}
					<Resizable.Handle
						withHandle
						onDraggingChange={(dragging) => {
							manualDragging = dragging;
							if (!dragging) panes[idx].resize((100 / totalDuration) * cyclesPerRIR);
						}}
					/>
				{/if}
			{/each}
		{/key}
	</Resizable.PaneGroup>

	<Button type="submit">Next</Button>
</form>
