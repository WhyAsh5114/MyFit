<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";
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
    const response = await fetch(`/api/exerciseSplits/${exerciseSplit._id}`, { method: "DELETE" });
    modalTitle = response.ok ? "Success" : "Error";
    modalText = await response.text();

    if (response.ok) {
      modalOnClose = async () => {
        await invalidate(`/api/exerciseSplits/${exerciseSplit._id}`);
        await goto("/exerciseSplits");
      };
    }

    confirmDeleteModal.close();
    modal.show();
    callingEndpoint = false;
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
        <span class="loading loading-bars"></span>
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
  <button class="join-item btn btn-primary">Edit</button>
</div>
