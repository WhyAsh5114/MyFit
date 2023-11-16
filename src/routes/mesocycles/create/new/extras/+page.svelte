<script lang="ts">
	import MyModal from "$lib/components/MyModal.svelte";
	import { caloricStates, muscleGroups } from "$lib/types/arrays";
	import {
		exerciseSplit,
		mesocycleCaloricState,
		mesocycleName,
		mesocycleRIRProgression,
		mesocycleSpecialization,
		mesocycleStartRIR
	} from "../newMesocycleStore";
	import DeleteIcon from "virtual:icons/ph/x-bold";

	let remainingMuscleGroups = muscleGroups.slice();
	let specializedMuscleGroups: MuscleGroup[] = [];

	let selectedMuscleGroup: MuscleGroup | undefined;

	let showSpecializedMuscleGroups = false;

	function specializeMuscleGroup() {
		if (!selectedMuscleGroup) return;

		specializedMuscleGroups = [...specializedMuscleGroups, selectedMuscleGroup];

		const idx = remainingMuscleGroups.indexOf(selectedMuscleGroup);
		remainingMuscleGroups.splice(idx, 1);
		remainingMuscleGroups = remainingMuscleGroups;

		selectedMuscleGroup = undefined;
		if (specializedMuscleGroups.length === 1) showSpecializedMuscleGroups = true;
	}

	function removeSpecializedMuscleGroup(muscleGroup: MuscleGroup) {
		const idx = specializedMuscleGroups.indexOf(muscleGroup);
		specializedMuscleGroups.splice(idx, 1);
		specializedMuscleGroups = specializedMuscleGroups;

		remainingMuscleGroups = [...remainingMuscleGroups, muscleGroup];
		if (specializedMuscleGroups.length === 0) showSpecializedMuscleGroups = false;
	}

	let errorModal: HTMLDialogElement;
	async function submitForm() {
		if ($mesocycleSpecialization && specializedMuscleGroups.length === 0) {
			errorModal.show();
			return false;
		}
		const createdMesocycle: MesocycleTemplate = {
			name: $mesocycleName,
			startRIR: $mesocycleStartRIR,
			RIRProgression: $mesocycleRIRProgression,
			exerciseSplit: $exerciseSplit,
			caloricBalance: $mesocycleCaloricState
		};
		
	}
</script>

<MyModal bind:dialogElement={errorModal} title="Error" titleColor="text-error">
	When specializing, add at least one muscle group to specialize
</MyModal>

<div class="flex flex-col w-full max-w-sm m-auto gap-10">
	<form
		class="flex flex-col w-full gap-2"
		id="caloric-state-form"
		on:submit|preventDefault={submitForm}
	>
		<div class="form-control">
			<label class="label" for="mesocycle-caloric-state">
				<span class="label-text">Mesocycle caloric state</span>
			</label>
			<select
				class="select select-bordered"
				id="mesocycle-caloric-state"
				bind:value={$mesocycleCaloricState}
				required
			>
				{#each caloricStates as { name, commonTerm, value }}
					<option {value}>{name} ({commonTerm})</option>
				{/each}
			</select>
		</div>
	</form>

	<form on:submit|preventDefault id="specialization-form" class="w-full">
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Specialization</span>
				<input
					type="checkbox"
					class="toggle"
					id="enable-specialization"
					bind:checked={$mesocycleSpecialization}
				/>
			</label>
		</div>
		{#if $mesocycleSpecialization}
			<div class="form-control w-full">
				<div class="flex gap-1">
					<select
						class="select select-bordered grow"
						id="specialize-muscle-group"
						bind:value={selectedMuscleGroup}
					>
						<option disabled selected value={undefined}>Pick one</option>
						{#each remainingMuscleGroups as muscleGroup}
							<option value={muscleGroup}>{muscleGroup}</option>
						{/each}
					</select>
					<button class="btn btn-primary" on:click={specializeMuscleGroup}>Add</button>
				</div>
			</div>
			<div class="collapse bg-primary collapse-arrow rounded-md mt-2">
				<input
					type="checkbox"
					id="show-specialized-muscle-groups"
					bind:checked={showSpecializedMuscleGroups}
				/>
				<div class="collapse-title text-lg font-medium">
					Specialized muscle groups: {specializedMuscleGroups.length}
				</div>
				<div class="collapse-content backdrop-brightness-75">
					<div class="flex flex-wrap gap-1.5 justify-center mt-3">
						{#each specializedMuscleGroups as muscleGroup}
							<button
								class="badge gap-1 badge-accent font-semibold"
								on:click={() => removeSpecializedMuscleGroup(muscleGroup)}
							>
								{muscleGroup}
								<DeleteIcon />
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</form>
</div>

<button type="submit" form="caloric-state-form" class="btn btn-block btn-accent">Submit</button>
