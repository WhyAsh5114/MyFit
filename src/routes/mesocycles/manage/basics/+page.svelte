<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Resizable from '$lib/components/ui/resizable';
	import * as Select from '$lib/components/ui/select';
	import H3 from '$lib/components/ui/typography/H3.svelte';

	import { goto } from '$app/navigation';
	import { arraySum } from '$lib/utils';
	import type { PaneAPI } from 'paneforge';
	import { mesocycleRunes } from '../mesocycleRunes.svelte';

	let manualDragging = false;
	let panes: PaneAPI[] = $state([]);

	let RIRProgression = $state(structuredClone($state.snapshot(mesocycleRunes.mesocycle.RIRProgression)));
	let totalDuration = $state(arraySum(mesocycleRunes.mesocycle.RIRProgression));
	let selectedRIRs: number[] = $state(
		mesocycleRunes.mesocycle.RIRProgression.map((_, idx) =>
			mesocycleRunes.mesocycle.RIRProgression[idx] > 0 ? idx : -1
		)
			.filter((idx) => idx !== -1)
			.toReversed()
	);

	function generateRIRDistribution(selectedRirValues: number[], totalWeeks: number) {
		if (selectedRirValues.length === 0) {
			RIRProgression = [totalWeeks];
			return;
		}

		const sortedRirs = [...selectedRirValues].sort((a, b) => b - a);
		const maxRir = Math.max(...sortedRirs);
		const rirDistribution: number[] = Array(maxRir + 1).fill(0);

		let remainingWeeks = totalWeeks;
		const weeksPerRir = Math.floor(totalWeeks / selectedRirValues.length);

		for (const rir of selectedRirValues) {
			rirDistribution[rir] = weeksPerRir;
			remainingWeeks -= weeksPerRir;
		}

		let rirIndex = 0;
		while (remainingWeeks > 0 && rirIndex < selectedRirValues.length) {
			rirDistribution[selectedRirValues[rirIndex]]++;
			remainingWeeks--;
			rirIndex++;
		}
		RIRProgression = rirDistribution;
	}

	function saveBasics(e: SubmitEvent) {
		e.preventDefault();
		mesocycleRunes.mesocycle.RIRProgression = RIRProgression;
		mesocycleRunes.saveStoresToLocalStorage();
		goto('/mesocycles/manage/progression');
	}
</script>

<H3>Basics</H3>

<form class="flex grow flex-col gap-2" onsubmit={saveBasics}>
	<div class="flex w-full flex-col gap-1.5">
		<Label for="mesocycle-name">Mesocycle name</Label>
		<Input id="mesocycle-name" placeholder="Type here" required bind:value={mesocycleRunes.mesocycle.name} />
	</div>

	<div class="flex gap-2">
		<div class="flex basis-1/2 flex-col gap-1.5">
			<Select.Root
				multiple
				onSelectedChange={(s) => {
					if (!s) return;
					selectedRIRs = s.sort((a, b) => (b.value as number) - (a.value as number)).map((s) => s.value as number);
					generateRIRDistribution(selectedRIRs, totalDuration);
				}}
				selected={selectedRIRs.map((rir) => ({ value: rir, label: `${rir} RIR` }))}
			>
				<Select.Label class="p-0 text-sm font-medium leading-none">Select RIRs</Select.Label>
				<Select.Trigger>
					<Select.Value placeholder="Select RIRs" />
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
				max={20}
				min={Math.max(1, selectedRIRs.length)}
				oninput={(e) => {
					totalDuration = e.currentTarget.valueAsNumber;
					if (!isNaN(totalDuration)) generateRIRDistribution(selectedRIRs, totalDuration);
				}}
				placeholder="Type here"
				required
				type="number"
				value={totalDuration}
			/>
		</div>
	</div>

	<span class="text-sm font-medium leading-none">RIR progression</span>
	<Resizable.PaneGroup class="rounded-lg border" direction="vertical">
		{#each selectedRIRs as rir, idx}
			{#key selectedRIRs.join(',') + totalDuration}
				<Resizable.Pane
					defaultSize={(100 / totalDuration) * (RIRProgression[rir] || 0)}
					minSize={100 / totalDuration}
					onResize={(size) => {
						if (!manualDragging) return;
						RIRProgression[rir] = Math.round((size / 100) * totalDuration);
					}}
					bind:pane={panes[idx]}
				>
					<div class="flex h-full items-center justify-between px-4">
						<span class="text-center font-semibold">{rir} RIR</span>
						<span class="text-center text-sm text-muted-foreground">{RIRProgression[rir] || 0} cycles</span>
					</div>
				</Resizable.Pane>
			{/key}
			{#if idx !== selectedRIRs.length - 1}
				<Resizable.Handle
					onDraggingChange={(dragging) => {
						manualDragging = dragging;
						if (!dragging) panes[idx].resize((100 / totalDuration) * (RIRProgression[rir] || 0));
					}}
					withHandle
				/>
			{/if}
		{/each}
	</Resizable.PaneGroup>

	<Button type="submit">Next</Button>
</form>
