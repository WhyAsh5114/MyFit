<script lang="ts">
	import SplitInputTable from "./SplitInputTable.svelte";
	import {
		exerciseSplitAsynchronous,
		exerciseSplitSynchronous,
		isAsynchronous
	} from "../newMesocycleStore";
	import { goto } from "$app/navigation";
	import MyModal from "$lib/components/MyModal.svelte";

    let errorModal: HTMLDialogElement;
	async function validateSplit() {
		let totalWorkouts = 0;
		if ($isAsynchronous) {
			$exerciseSplitAsynchronous.forEach((splitDay) => {
				if (splitDay !== null) totalWorkouts++;
			});
		} else {
			$exerciseSplitSynchronous.forEach((splitDay) => {
				if (splitDay !== null) totalWorkouts++;
			});
		}
        if (totalWorkouts === 0) {
            errorModal.show();
            return false;
        }
        await goto('/mesocycles/create/new/exercises');
	}
</script>

<MyModal title="Error" titleColor="text-red-500" bind:dialogElement={errorModal}>
    Need to have at least one workout in a microcycle
</MyModal>
<form on:submit|preventDefault={validateSplit} class="flex flex-col grow">
	<div class="flex flex-col my-auto w-full max-w-xs mx-auto">
		<div class="form-control mb-10">
			<label class="label">
				<span class="label-text">Asynchronous</span>
				<input type="checkbox" class="toggle" id="cycle-type" bind:checked={$isAsynchronous} />
			</label>
		</div>
		<SplitInputTable />
	</div>
	<div class="join grid grid-cols-2">
		<a href="/mesocycles/create/new/basics" class="btn join-item btn-primary">Previous</a>
		<button class="btn join-item btn-accent">Next</button>
	</div>
</form>
