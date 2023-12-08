<script lang="ts">
  import SplitInputTable from "./SplitInputTable.svelte";
  import { exerciseSplit } from "../newMesocycleStore";
  import { goto } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";

  let errorModal: HTMLDialogElement;
  async function validateSplit() {
    let totalWorkouts = 0;
    $exerciseSplit.forEach((splitDay) => {
      if (splitDay !== null) totalWorkouts++;
    });
    if (totalWorkouts === 0) {
      errorModal.show();
      return false;
    }
    await goto("/mesocycles/create/new/exercises");
  }
</script>

<MyModal title="Error" bind:dialogElement={errorModal}>
  Need to have at least one workout in a microcycle
</MyModal>
<form on:submit|preventDefault={validateSplit} class="flex flex-col grow">
  <SplitInputTable />
  <div class="join grid grid-cols-2">
    <a href="/mesocycles/create/new/basics" class="btn join-item btn-primary">Previous</a>
    <button class="btn join-item btn-accent">Next</button>
  </div>
</form>
