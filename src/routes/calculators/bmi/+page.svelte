<script lang="ts">
	let unitSystem = 'Metric';
	let height = '';
	let weight = '';

	let BMI = NaN;
	function calcBMI() {
		if (unitSystem === 'Metric') BMI = Math.round((parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)) * 10) / 10;
		else BMI = Math.round(((703 * parseFloat(weight)) / Math.pow(parseFloat(height), 2)) * 10) / 10;
	}

	let selectedBMIMapping = [18.5, 'Normal', 'text-success'];
	let BMIMapping: [number, string, string][] = [
		[40, 'Morbidly obese', 'text-red-500'],
		[35, 'Severely obese', 'text-red-500'],
		[30, 'Obese', 'text-red-500'],
		[25, 'Overweight', 'text-warning'],
		[18.5, 'Normal', 'text-success'],
		[16, 'Underweight', 'text-warning']
	];
	$: {
		selectedBMIMapping =
			BMIMapping.find((mapping) => {
				return BMI >= mapping[0];
			}) ?? BMIMapping[5];
	}
</script>

<form class="bg-primary p-3 w-full max-w-sm flex flex-col items-center rounded-md gap-2" on:submit|preventDefault={calcBMI}>
	<h3 class="text-lg font-semibold">Body Mass Index Calculator</h3>
	<div class="h-px w-full bg-white mb-5 -mt-1"></div>
	<div class="flex justify-between w-full max-w-xs">
		<div class="form-control">
			<label class="label cursor-pointer gap-5">
				<span class="label-text">Metric</span>
				<input type="radio" bind:group={unitSystem} name="unit-system" value="Metric" class="radio" />
			</label>
		</div>
		<div class="form-control">
			<label class="label cursor-pointer gap-5">
				<span class="label-text">Imperial</span>
				<input type="radio" bind:group={unitSystem} name="unit-system" value="Imperial" class="radio" />
			</label>
		</div>
	</div>
	<input
		type="number"
		placeholder="Height ({unitSystem === 'Metric' ? 'centimeters' : 'inches'})"
		class="input input-bordered w-full max-w-xs"
		name="height"
		bind:value={height}
	/>
	<input
		type="number"
		placeholder="Weight ({unitSystem === 'Metric' ? 'kilograms' : 'pounds'})"
		class="input input-bordered w-full max-w-xs"
		name="weight"
		bind:value={weight}
	/>
	<button class="btn btn-block btn-accent mt-7">Calculate</button>
</form>

<div class="stats bg-primary mt-10 w-44">
	<div class="stat">
		<div class="">Your BMI is</div>
		<div class="stat-value {selectedBMIMapping[2]}">
			{BMI}
		</div>
		<div class="text-sm">
			{selectedBMIMapping[1]}
		</div>
	</div>
</div>
