<script>
	import { duration } from '../newMesoStore';
</script>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full mb-5">
	<h3 class="card-title">Mesocycle name</h3>
	<div class="h-0.5 bg-black mt-1 mb-4" />
	<input type="text" placeholder="Type here" class="input input-sm w-full" />
</div>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
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
			class="range range-xs {$duration >= 4 && $duration <= 16 ? 'range-secondary' : 'range-warning'}"
		/>
	</div>
</div>
