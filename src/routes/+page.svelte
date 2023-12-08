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
  <TodaysWorkoutCard bind:activeMesocycle {activeMesocycleTemplate} />
{:else}
  No active mesocycle found
  <a href="/mesocycles" class="btn btn-accent mt-1">Go to mesocycles</a>
{/if}
