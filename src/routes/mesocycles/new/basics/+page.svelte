<script>
	import { duration, mesoName, startRIR } from '../newMesoStore';
</script>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full mb-5">
	<h3 class="card-title">Mesocycle name</h3>
	<div class="h-0.5 bg-black mt-1 mb-4" />
	<input type="text" placeholder="Type here" class="input input-sm w-full" bind:value={$mesoName} />
</div>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full mb-5">
	<div class="flex justify-between">
		<h3 class="card-title">Mesocycle duration</h3>
		<button class="help-button">?</button>
	</div>
	<div class="h-0.5 bg-black mt-1 mb-4" />
	<div class="flex items-center gap-2">
		<p class="text-center basis-28 bg-black rounded-md text-sm py-1">{$duration} weeks</p>
		<input
			type="range"
			min="2"
			max="20"
			bind:value={$duration}
			class="range range-xs {$duration >= 4 && $duration <= 16
				? 'range-secondary'
				: 'range-warning'}"
		/>
	</div>
</div>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
	<div class="flex justify-between">
		<h3 class="card-title">Start Reps In Reserve</h3>
		<button class="help-button">?</button>
	</div>
	<div class="h-0.5 bg-black mt-1 mb-4" />
	<select class="select select-sm select-bordered w-full" bind:value={$startRIR}>
		<option class="text-success" value="4">4 RIR</option>
		<option class="text-warning" value="3" selected>3 RIR</option>
		<option class="text-error" value="2">2 RIR</option>
		<option class="text-error" value="1">1 RIR</option>
	</select>
</div>
