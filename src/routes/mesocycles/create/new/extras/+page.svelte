<script lang="ts">
	import { mesocycleCaloricState } from "../newMesocycleStore";
	const caloricStates = [
		{ name: "Hypo-caloric", value: -1 },
		{ name: "Iso-caloric", value: 0 },
		{ name: "Hyper-caloric", value: 1 }
	];
</script>

<div class="form-control w-full max-w-xs">
	<label class="label" for="mesocycle-caloric-state">
		<span class="label-text">Target muscle</span>
	</label>
	<select
		class="select select-bordered"
		id="mesocycle-caloric-state"
		bind:value={$mesocycleCaloricState}
		required
	>
		<option value={undefined} disabled selected>Pick one</option>
		{#each caloricStates as muscleGroup}
			<option>{muscleGroup}</option>
		{/each}
	</select>
</div>
