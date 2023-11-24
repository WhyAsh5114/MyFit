<script lang="ts">
	import DoneIcon from "virtual:icons/material-symbols/done";
	import EditIcon from "virtual:icons/material-symbols/edit-outline";
	export let exercise: WorkoutExerciseWithoutSetNumbers;

	let setsCompleted = Array(exercise.sets.length).fill(false);
</script>

{#each exercise.sets as { reps, load, RIR }, setNumber}
	<form class="contents" on:submit|preventDefault={() => (setsCompleted[setNumber] = true)}>
		<div class="flex">
			<input
				type="number"
				id="{exercise.name}-set{setNumber}-reps"
				class="input input-sm w-12"
				bind:value={reps}
				placeholder="?"
				min={0}
				required
				disabled={setsCompleted[setNumber]}
			/>
		</div>
		<div class="flex">
			<input
				type="number"
				id="{exercise.name}-set{setNumber}-load"
				class="input input-sm w-12"
				bind:value={load}
				placeholder="?"
				required
				disabled={setsCompleted[setNumber]}
			/>
		</div>
		<div class="flex">
			<input
				type="number"
				id="{exercise.name}-set{setNumber}-RIR"
				class="input input-sm w-12"
				bind:value={RIR}
				placeholder="?"
				min={0}
				max={10}
				required
				disabled={setsCompleted[setNumber]}
			/>
		</div>
		{#if !setsCompleted[setNumber]}
			<button
				class="btn btn-xs btn-accent btn-circle"
				aria-label="mark-set-complete"
				disabled={setsCompleted[setNumber]}
			>
				<DoneIcon />
			</button>
		{:else}
			<button
				class="btn btn-xs btn-circle bg-base-100/25 border-0"
				on:click={() => (setsCompleted[setNumber] = false)}
				aria-label="edit-set"
			>
				<EditIcon />
			</button>
		{/if}
	</form>
{/each}
