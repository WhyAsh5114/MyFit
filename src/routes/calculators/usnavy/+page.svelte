<script lang="ts">
	let unitSystem = 'Metric';
	let height = '';
	let weight = '';
	let gender = 'Male';
	let neck = '';
	let waist = '';
	let hip = '';

	let BFP = NaN;
	let fatMass = NaN;
	let leanMass = NaN;
	function calcBFP() {
		let _height = parseFloat(height);
		let _weight = parseFloat(weight);
		let _neck = parseFloat(neck);
		let _waist = parseFloat(waist);
		let _hip = parseFloat(hip);

		if (unitSystem === 'Imperial') {
			_height /= 2.54;
			_neck /= 2.54;
			_waist /= 2.54;
			_hip /= 2.54;
			_weight *= 2.204;
		}
		if (gender === 'Male') {
			BFP = 86.01 * Math.log10(_waist - _neck) - 70.041 * Math.log10(_height) + 36.76;
		} else {
			BFP = 163.205 * Math.log10(_waist + _hip - _neck) - 97.684 * Math.log10(_height) - 78.387;
		}
		fatMass = (BFP / 100) * _weight;
		leanMass = _weight - fatMass;
	}

    // TODO: make color mapping and text description for US navy body fat % standards
</script>

<form class="bg-primary p-3 w-full max-w-sm flex flex-col items-center rounded-md gap-2" on:submit|preventDefault={calcBFP}>
	<h3 class="text-lg font-semibold">US Navy Body Fat % Calculator</h3>
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
	<div class="flex justify-between w-full max-w-xs items-center bg-black rounded-md px-4">
		Gender
		<div class="form-control">
			<label class="label cursor-pointer gap-5">
				<span class="label-text">Male</span>
				<input type="radio" bind:group={gender} name="gender" value="Male" class="radio" />
			</label>
		</div>
		<div class="form-control">
			<label class="label cursor-pointer gap-5">
				<span class="label-text">Female</span>
				<input type="radio" bind:group={gender} name="gender" value="Female" class="radio" />
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
	<input
		type="number"
		placeholder="Neck ({unitSystem === 'Metric' ? 'centimeters' : 'inches'})"
		class="input input-bordered w-full max-w-xs"
		name="neck"
		bind:value={neck}
	/>
	<input
		type="number"
		placeholder="Waist ({unitSystem === 'Metric' ? 'centimeters' : 'inches'})"
		class="input input-bordered w-full max-w-xs"
		name="neck"
		bind:value={waist}
	/>
	{#if gender === 'Female'}
		<input
			type="number"
			placeholder="Hip ({unitSystem === 'Metric' ? 'centimeters' : 'inches'})"
			class="input input-bordered w-full max-w-xs"
			name="neck"
			bind:value={hip}
		/>
	{/if}
	<button class="btn btn-block btn-accent mt-7">Calculate</button>
</form>

<div class="stats bg-primary mt-10 w-full">
	<div class="stat">
		<div class="">Body fat %</div>
		<div class="stat-value">
			{BFP.toFixed(2)}%
		</div>
	</div>
</div>

<div class="stats bg-primary mt-2 w-full">
	<div class="stat">
		<div class="">Fat mass</div>
		<div class="stat-value">
			{fatMass.toFixed(2)} kg
		</div>
	</div>
	<div class="stat">
		<div class="">Lean mass</div>
		<div class="stat-value">
			{leanMass.toFixed(2)} kg
		</div>
	</div>
</div>
