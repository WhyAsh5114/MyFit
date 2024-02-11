<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";
  import { setExerciseSplitStores, editingSplitId } from "../../[mode]/splitStore";
  import ViewSplitExercises from "./ViewSplitExercises.svelte";
  import ViewSplitStats from "./ViewSplitStats.svelte";

  export let data;
  $: ({ exerciseSplit } = data);

  let modal: HTMLDialogElement;
  let modalTitle = "";
  let modalText = "";
  let modalOnClose = () => {};

  let confirmDeleteModal: HTMLDialogElement;
  let currentSection: "Stats" | "Exercises" = "Stats";
  let callingEndpoint = false;

  async function deleteSplit() {
    callingEndpoint = true;
    const response = await fetch(`/api/exerciseSplits/${exerciseSplit._id}`, {
      method: "DELETE"
    });
    if (response.ok) modalOnClose = invalidateAndRedirect;
    confirmDeleteModal.close();
    modalTitle = response.ok ? "Success" : "Error";
    modalText = await response.text();
    modal.show();
    callingEndpoint = false;
  }

  async function invalidateAndRedirect() {
    await invalidate(`/api/exerciseSplits/${exerciseSplit._id}`);
    await goto("/exerciseSplits");
  }

  async function editExerciseSplit(exerciseSplit: WithSID<ExerciseSplit>) {
    $editingSplitId = exerciseSplit._id;
    setExerciseSplitStores(exerciseSplit);
    await goto(`/exerciseSplits/edit?editId=${exerciseSplit._id}`);
  }
</script>

<MyModal {modalOnClose} title={modalTitle} bind:dialogElement={modal}>
  {modalText}
</MyModal>

<MyModal title="Delete split?" bind:dialogElement={confirmDeleteModal}>
  <p>
    Are you sure you want to delete the split:
    <span class="font-semibold">{exerciseSplit.name}</span>
  </p>
  <div class="join grid grid-cols-2 mt-4">
    <button class="join-item btn">No, cancel</button>
    <button class="join-item btn btn-error" disabled={callingEndpoint} on:click={deleteSplit}>
      {#if !callingEndpoint}
        Yes, delete
      {:else}
        Deleting <span class="loading loading-spinner"></span>
      {/if}
    </button>
  </div>
</MyModal>

<h2>View split</h2>

<div class="join w-full grid grid-cols-2 mb-2">
  <input
    name="view"
    class="join-item btn btn-primary checked:!bg-accent checked:!text-black"
    aria-label="Stats"
    checked
    type="radio"
    value="Stats"
    bind:group={currentSection}
  />
  <input
    name="view"
    class="join-item btn btn-primary checked:!bg-accent checked:!text-black"
    aria-label="Exercises"
    type="radio"
    value="Exercises"
    bind:group={currentSection}
  />
</div>

{#if currentSection === "Stats"}
  <ViewSplitStats {exerciseSplit} />
{:else}
  <ViewSplitExercises {exerciseSplit} />
{/if}

<div class="join grid grid-cols-2 mt-auto">
  <button class="join-item btn btn-error" on:click={() => confirmDeleteModal.show()}>Delete</button>
  <button class="join-item btn btn-primary" on:click={() => editExerciseSplit(exerciseSplit)}>
    Edit
  </button>
</div>
