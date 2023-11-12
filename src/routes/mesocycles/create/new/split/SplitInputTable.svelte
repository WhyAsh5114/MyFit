<script lang="ts">
	import SplitInput from "./SplitInput.svelte";
	import { isAsynchronous } from "../newMesocycleStore";
	import { exerciseSplitSynchronous, exerciseSplitAsynchronous } from "../newMesocycleStore";

	const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	function addDay() {
		$exerciseSplitAsynchronous.push({ name: "", exercises: [] });
		$exerciseSplitAsynchronous = $exerciseSplitAsynchronous;
	}
	function removeDay() {
		$exerciseSplitAsynchronous.pop();
		$exerciseSplitAsynchronous = $exerciseSplitAsynchronous;
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex w-full justify-end">
		<span>Rest</span>
	</div>
	{#if $isAsynchronous}
		<div class="flex flex-col gap-2 overflow-y-auto max-h-96">
			{#each $exerciseSplitAsynchronous as splitDay, i}
				<SplitInput dayText={`Day ${i + 1}`} bind:splitDay />
			{/each}
		</div>
		<div class="join grid grid-cols-2 gap-1 mt-5">
			<button
				class="btn join-item btn-primary text-xl font-bold btn-sm"
				type="button"
				on:click={removeDay}
			>
				−
			</button>
			<button
				class="btn join-item btn-primary text-xl font-bold btn-sm"
				type="button"
				on:click={addDay}
			>
				+
			</button>
		</div>
	{:else}
		{#each $exerciseSplitSynchronous as splitDay, i}
			<SplitInput dayText={days[i]} bind:splitDay />
		{/each}
	{/if}
</div>
