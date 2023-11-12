<script lang="ts">
	import MyModal from "$lib/components/MyModal.svelte";
	import { slide } from "svelte/transition";
	import { mesocycleName, mesocycleDuration, mesocycleStartRIR, mesocycleRIRProgression } from "../newMesocycleStore";
	let customizeRIRProgression = false;

	let RIRColors = ["range-error", "range-warning", "range-accent", "range-success"];
	function calculateRIRProgression(totalDuration: number, startRIR: number) {
		let failureWeek = false;
		if (totalDuration > 0) {
			failureWeek = true;
			totalDuration -= 1;
		}
		let quotient = Math.floor(totalDuration / startRIR);
		let remainder = totalDuration % startRIR;
		quotient = isNaN(quotient) ? 0 : quotient;
		remainder = isNaN(remainder) ? 0 : remainder;

		let result = new Array(startRIR - remainder)
			.fill(quotient)
			.concat(new Array(remainder).fill(quotient + 1));

		let progression: ProgressionData[] = [];
		for (let i = startRIR; i >= 1; i--) {
			progression.push({ specificRIR: i, durationInWeeks: result[startRIR - i] });
		}
		progression.push({ specificRIR: 0, durationInWeeks: failureWeek ? 1 : 0 });
		return progression;
	}

	$: RIRProgression = calculateRIRProgression($mesocycleDuration, $mesocycleStartRIR);
	// Get number of weeks before 'x' RIR training begins
	function previousWeeks(RIR: number) {
		let prevWeeks = 0;
		RIRProgression.forEach((progression) => {
			if (RIR < progression.specificRIR) {
				prevWeeks += progression.durationInWeeks;
			}
		});
		return prevWeeks;
	}

	function modifyProgression(RIR: number, duration: number) {
		// Set the current RIR's duration
		const p = RIRProgression.find(
			(progression) => progression.specificRIR === RIR
		) as ProgressionData;
		p.durationInWeeks = duration;

		// If no upcoming RIRs, function complete
		if (RIR === 0) {
			// Update DOM
			RIRProgression = RIRProgression;
			return;
		}

		// Modify the upcoming RIRs' progression
		let laterProgression = calculateRIRProgression(
			$mesocycleDuration - previousWeeks(RIR) - duration,
			RIR - 1
		);
		laterProgression.forEach(({ specificRIR, durationInWeeks }) => {
			const p = RIRProgression.find(
				(originalProgression) => originalProgression.specificRIR === specificRIR
			) as ProgressionData;
			p.durationInWeeks = duration;
		});

		// Update DOM
		RIRProgression = RIRProgression;
	}

	let errorModal: HTMLDialogElement;
	function validateProgression() {
		// TODO: make sure total duration matches sum of all specific RIR durations
		let totalDuration = 0;
		RIRProgression.forEach(({ durationInWeeks }) => {
			totalDuration += durationInWeeks;
		});
		if (totalDuration < $mesocycleDuration) {
			errorModal.show();
			return false;
		}
		$mesocycleRIRProgression = RIRProgression;
	}
</script>

<MyModal title="Error" titleColor="text-error" bind:dialogElement={errorModal}>
	<p>
		Weekly RIR duration is less than total mesocycle duration, re-adjust the sliders accordingly
	</p>
</MyModal>
<form class="flex flex-col w-full grow" on:submit|preventDefault={validateProgression}>
	<div class="flex flex-col my-auto">
		<div class="form-control w-full max-w-xs mx-auto">
			<label class="label" for="mesocycle-name">
				<span class="label-text">Mesocycle name</span>
			</label>
			<input
				type="text"
				placeholder="Type here"
				id="mesocycle-name"
				class="input input-bordered w-full"
				bind:value={$mesocycleName}
				required
			/>
		</div>
		<div class="form-control w-full mt-6 max-w-xs mx-auto">
			<label class="label" for="mesocycle-duration">
				<span class="label-text">Mesocycle duration</span>
				<span class="label-text-alt">{$mesocycleDuration} weeks</span>
			</label>
			<input
				type="range"
				min="4"
				max="20"
				bind:value={$mesocycleDuration}
				class="range range-secondary"
				id="mesocycle-duration"
			/>
		</div>
		<div class="form-control w-full mt-6 max-w-xs mx-auto">
			<label class="label" for="mesocycle-start-RIR">
				<span class="label-text">Start RIR</span>
			</label>
			<select
				class="select select-bordered"
				id="mesocycle-start-RIR"
				bind:value={$mesocycleStartRIR}
			>
				<option value={3}>3 RIR</option>
				<option value={2}>2 RIR</option>
				<option value={1}>1 RIR</option>
				<option value={0}>0 RIR</option>
			</select>
		</div>
		<div class="form-control mt-6 max-w-xs mx-auto w-full">
			<label class="label cursor-pointer">
				<span class="label-text">Customize RIR progression</span>
				<input
					type="checkbox"
					class="toggle"
					id="customize-RIR-progression"
					bind:checked={customizeRIRProgression}
				/>
			</label>
		</div>
		{#if customizeRIRProgression}
			<div class="flex flex-col" transition:slide={{ duration: 200 }}>
				{#each RIRProgression as { specificRIR, durationInWeeks }}
					<div class="form-control w-full max-w-xs mx-auto">
						<label class="label" for={`${specificRIR}-RIR-duration`}>
							<span class="label-text">{specificRIR} RIR</span>
							<span class="label-text-alt">{durationInWeeks} weeks</span>
						</label>
						<input
							type="range"
							min={0}
							max={$mesocycleDuration - previousWeeks(specificRIR)}
							value={durationInWeeks}
							on:input={(e) => modifyProgression(specificRIR, parseInt(e.currentTarget.value))}
							class="range range-xs range-secondary {RIRColors[specificRIR]}"
							id={`${specificRIR}-RIR-duration`}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<div class="join grid grid-cols-2">
		<button class="btn btn-accent join-item" disabled>Previous</button>
		<a class="btn btn-accent join-item" href="/mesocycles/create/new/split">Next</a>
	</div>
</form>
