<script lang="ts">
  export let data;
  import TodaysWorkoutCard from "./TodaysWorkoutCard.svelte";
  import ActiveMesocycleCard from "./mesocycles/ActiveMesocycleCard.svelte";

  $: ({ activeMesocycle, activeMesocycleTemplate } = data);
</script>

<h2>Home</h2>
{#if !data.session}
  Log in to use the app
  <a class="btn btn-accent mt-1" href="/login">Login</a>
{:else if activeMesocycle && activeMesocycleTemplate}
  <h3 class="text-xl mb-1">Active mesocycle</h3>
  <ActiveMesocycleCard {activeMesocycle} {activeMesocycleTemplate} />

  <h3 class="text-xl mb-1 mt-2">Upcoming workout</h3>
  <TodaysWorkoutCard {activeMesocycle} {activeMesocycleTemplate} />
{:else}
  No active mesocycle found
  <a class="btn btn-accent mt-1" href="/mesocycles">Go to mesocycles</a>
{/if}

<a class="flex mt-auto bg-primary p-2 rounded-md" href="/v3notice">
  <p><span class="font-semibold text-accent">Important notice!</span> Click here to read</p>
</a>
