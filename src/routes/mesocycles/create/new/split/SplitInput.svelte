<script lang="ts">
  export let dayText: string;
  export let splitDay: MesocycleTemplate["exerciseSplit"][number];

  let isRestDay = splitDay === null;
  $: splitDay = isRestDay ? null : splitDay ?? { name: "", exercises: [] };
</script>

<div class="flex justify-between items-center">
  <div class="join basis-3/4 items-center shrink">
    <span class="btn btn-primary btn-sm join-item basis-16 p-0 shrink-0 text-center">
      {dayText}
    </span>
    {#if splitDay !== null}
      <input
        id="{dayText}-workout-name"
        class="input input-bordered join-item input-sm"
        required
        bind:value={splitDay.name}
      />
    {:else}
      <input
        id="{dayText}-workout-name"
        class="input input-bordered join-item input-sm"
        disabled
        placeholder="Rest"
      />
    {/if}
  </div>
  <input
    id="is-{dayText}-rest"
    class="checkbox shrink-0"
    type="checkbox"
    bind:checked={isRestDay}
  />
</div>
