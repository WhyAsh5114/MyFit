<script lang="ts">
  export let splitDays: ExerciseSplit["splitDays"];
</script>

<div class="flex flex-wrap w-full gap-1">
  {#each splitDays as splitDay}
    {#if splitDay}
      <span class="badge">{splitDay.name}</span>
    {:else}
      <span class="badge badge-accent"></span>
    {/if}
  {/each}
</div>
