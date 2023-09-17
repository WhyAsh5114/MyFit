<script lang="ts">
	let mesocycleDuration = 8;
</script>

<form class="form-control w-full max-w-xs gap-5">
	<div>
		<label class="label" for="mesocycle-name">
			<span class="label-text">Mesocycle name</span>
		</label>
		<input
			type="text"
			placeholder="Type here"
			class="input input-bordered w-full max-w-xs"
			id="mesocycle-name"
		/>
	</div>
	<div>
		<label for="mesocycle-duration" class="label">
			<span class="label-text">Mesocycle duration</span>
			<span class="label-text-alt">{mesocycleDuration} weeks</span>
		</label>
		<input
			type="range"
			min="2"
			max="16"
			bind:value={mesocycleDuration}
			class="range"
			id="mesocycle-duration"
		/>
	</div>
	<div class="w-full max-w-xs">
		<label class="label" for="mesocycle-start-RIR">
			<span class="label-text">Mesocycle start RIR</span>
		</label>
		<select class="select select-bordered w-full max-w-xs" id="mesocycle-start-RIR">
			<option>4 RIR</option>
			<option>3 RIR</option>
			<option>2 RIR</option>
			<option>1 RIR</option>
		</select>
	</div>
	<label class="label cursor-pointer">
		<span class="label-text">Fat loss mesocycle</span>
		<input type="checkbox" class="toggle" id="fat-loss-mesocycle" />
	</label>
</form>
