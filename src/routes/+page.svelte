<script lang="ts">
  export let data;
  import TodaysWorkoutCard from "./TodaysWorkoutCard.svelte";
  import ActiveMesocycleCard from "./mesocycles/ActiveMesocycleCard.svelte";
  import PartyPopper from "virtual:icons/lucide/party-popper";

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

<a class="flex p-4 rounded-lg gap-4 items-center bg-primary mt-auto" href="/v3">
  <PartyPopper class="text-accent basis-8 shrink-0" />
  <span>MyFit V3 is out! Click here to learn more and migrate.</span>
</a>
