<script lang="ts">
	import {
		mesocycleDuration,
		mesocycleName,
		mesocycleStartRIR,
		mesocycleFatLossPhase
	} from '../newMesocycleStore';
	import { goto } from '$app/navigation';
</script>

<form
	class="w-full grow flex flex-col justify-center items-center"
	on:submit|preventDefault={() => goto('/mesocycles/new/custom/split')}
>
	<div class="form-control w-full max-w-xs gap-5 my-auto">
		<div>
			<label class="label" for="mesocycle-name">
				<span class="label-text">Mesocycle name</span>
			</label>
			<input
				type="text"
				placeholder="Type here"
				class="input input-bordered w-full max-w-xs"
				id="mesocycle-name"
				bind:value={$mesocycleName}
				required
			/>
		</div>
		<div>
			<label for="mesocycle-duration" class="label">
				<span class="label-text">Mesocycle duration</span>
				<span class="label-text-alt">{$mesocycleDuration} weeks</span>
			</label>
			<input
				type="range"
				min="2"
				max="16"
				bind:value={$mesocycleDuration}
				class="range"
				id="mesocycle-duration"
			/>
		</div>
		<div class="w-full max-w-xs">
			<label class="label" for="mesocycle-start-RIR">
				<span class="label-text">Mesocycle start RIR</span>
			</label>
			<select
				class="select select-bordered w-full max-w-xs"
				id="mesocycle-start-RIR"
				bind:value={$mesocycleStartRIR}
			>
				<option value={4}>4 RIR</option>
				<option value={3}>3 RIR</option>
				<option value={2}>2 RIR</option>
				<option value={1}>1 RIR</option>
			</select>
		</div>
		<label class="label cursor-pointer">
			<span class="label-text">Fat loss mesocycle</span>
			<input
				type="checkbox"
				class="toggle"
				id="fat-loss-mesocycle"
				bind:checked={$mesocycleFatLossPhase}
			/>
		</label>
	</div>
	<button type="submit" class="btn btn-block btn-primary">Next</button>
</form>
