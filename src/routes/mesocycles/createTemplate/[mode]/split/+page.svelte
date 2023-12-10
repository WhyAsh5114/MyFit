<script lang="ts">
  import SplitInputTable from "./SplitInputTable.svelte";
  import { exerciseSplit } from "../newMesocycleStore";
  import { goto } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";
  export let data;

  let errorModal: HTMLDialogElement;
  async function validateSplit() {
    let totalWorkouts = 0;
    $exerciseSplit.forEach((splitDay) => {
      if (splitDay !== null) {
        totalWorkouts++;
      }
    });
    if (totalWorkouts === 0) {
      errorModal.show();
      return false;
    }
    await goto(`./exercises?mesocycleTemplateId=${data.mesocycleTemplate?.id}`);
  }
</script>

<MyModal title="Error" bind:dialogElement={errorModal}>
  Need to have at least one workout in a microcycle
</MyModal>
<form class="flex flex-col grow" on:submit|preventDefault={validateSplit}>
  <SplitInputTable />
  <div class="join grid grid-cols-2">
    <a class="btn join-item btn-primary" href="/mesocycles/createTemplate/new/basics">Previous</a>
    <button class="btn join-item btn-accent">Next</button>
  </div>
</form>
