<script lang="ts">
  import OverviewTabContent from "./OverviewTabContent.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { page } from "$app/stores";
  import StructureTabContent from "./StructureTabContent.svelte";
  import ExercisesTabContent from "./ExercisesTabContent.svelte";

  $: ({ params } = $page);
  let currentTab: string | undefined = "structure";
</script>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>

<Tabs.Root
  value={currentTab}
  onValueChange={(v) => (currentTab = v)}
  class="w-full mt-4 grow flex flex-col"
>
  <Tabs.List class="w-full grid grid-cols-3">
    <Tabs.Trigger value="structure">Structure</Tabs.Trigger>
    <Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="structure">
    <StructureTabContent bind:currentTab />
  </Tabs.Content>
  <Tabs.Content value="exercises">
    <ExercisesTabContent bind:currentTab />
  </Tabs.Content>
  <Tabs.Content value="overview">
    <OverviewTabContent />
  </Tabs.Content>
</Tabs.Root>
