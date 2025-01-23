<script lang="ts">
  import { goto } from "$app/navigation";
  import { commonMesocycles } from "$lib/commonMesocycles";
  import { exerciseSplit, mesocycleName } from "../../[mode]/newMesocycleStore";

  async function setMesocycle(name: string, split: MesocycleTemplate["exerciseSplit"]) {
    $exerciseSplit = split;
    $mesocycleName = name;
    await goto("/mesocycles/newTemplate/basics");
  }
</script>

{#each commonMesocycles as mesocycle}
  <button
    class="btn btn-primary w-full h-fit py-3"
    on:click={async () => setMesocycle(mesocycle.name, mesocycle.exerciseSplit)}
  >
    <div class="flex flex-col w-full font-normal text-left gap-1">
      <span class="font-semibold text-lg">{mesocycle.name}</span>
      <div class="flex flex-wrap font-semibold gap-1 my-2">
        {#each mesocycle.exerciseSplit as split}
          {#if split}
            <span class="badge badge-accent">{split.name}</span>
          {:else}
            <span class="badge">Rest</span>
          {/if}
        {/each}
      </div>
      <p class="text-secondary/60">{mesocycle.description}</p>
    </div>
  </button>
{/each}
