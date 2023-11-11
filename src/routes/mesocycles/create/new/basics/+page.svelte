<script lang="ts">
	import { mesocycleName, mesocycleDuration, mesocycleStartRIR } from "../newMesocycleStore";
	let customizeRIRProgression = true;

	type ProgressionData = { specificRIR: number; duration: number };

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
			progression.push({ specificRIR: i, duration: result[startRIR - i] });
		}
		progression.push({ specificRIR: 0, duration: failureWeek ? 1 : 0 });
		return progression;
	}

	$: RIRProgression = calculateRIRProgression($mesocycleDuration, $mesocycleStartRIR);
	// Get number of weeks before 'x' RIR training begins
	function previousWeeks(RIR: number) {
		let prevWeeks = 0;
		RIRProgression.forEach((progression) => {
			if (RIR < progression.specificRIR) {
				prevWeeks += progression.duration;
			}
		});
		return prevWeeks;
	}

	function modifyProgression(RIR: number, duration: number) {
		// Set the current RIR's duration
		const p = RIRProgression.find(
			(progression) => progression.specificRIR === RIR
		) as ProgressionData;
		p.duration = duration;

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
		laterProgression.forEach(({ specificRIR, duration }) => {
			const p = RIRProgression.find(
				(originalProgression) => originalProgression.specificRIR === specificRIR
			) as ProgressionData;
			p.duration = duration;
		});

		// Update DOM
		RIRProgression = RIRProgression;
	}
</script>

<form class="flex flex-col gap-6 w-full max-w-xs mx-auto">
	<div class="form-control w-full mx-auto">
		<label class="label" for="mesocycle-name">
			<span class="label-text">Mesocycle name</span>
		</label>
		<input
			type="text"
			placeholder="Type here"
			id="mesocycle-name"
			class="input input-bordered w-full"
			bind:value={$mesocycleName}
		/>
	</div>

	<div class="form-control w-full">
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

	<div class="form-control w-full">
		<label class="label" for="mesocycle-start-RIR">
			<span class="label-text">Start RIR</span>
		</label>
		<select class="select select-bordered" id="mesocycle-start-RIR" bind:value={$mesocycleStartRIR}>
			<option value={3}>3 RIR</option>
			<option value={2}>2 RIR</option>
			<option value={1}>1 RIR</option>
			<option value={0}>0 RIR</option>
		</select>
	</div>

	<div class="form-control">
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
		<div class="flex flex-col">
			{#each RIRProgression as { specificRIR, duration }}
				<div class="form-control w-full">
					<label class="label" for={`${specificRIR}-RIR-duration`}>
						<span class="label-text">{specificRIR} RIR</span>
						<span class="label-text-alt">{duration} weeks</span>
					</label>
					<input
						type="range"
						min={0}
						max={$mesocycleDuration - previousWeeks(specificRIR)}
						value={duration}
						on:input={(e) => modifyProgression(specificRIR, parseInt(e.currentTarget.value))}
						class="range range-xs range-secondary {RIRColors[specificRIR]}"
						id={`${specificRIR}-RIR-duration`}
					/>
				</div>
			{/each}
		</div>
	{/if}
</form>
