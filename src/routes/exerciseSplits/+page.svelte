<script lang="ts">
  import SplitDaysSchedule from "./SplitDaysSchedule.svelte";
  import { getTotalSetsOfSplit } from "$lib/utils/exerciseSplits.js";
  import { onMount } from "svelte";
  import type { WithId } from "mongodb";
  import { Button } from "$lib/components/ui/button";
  import * as Drawer from "$lib/components/ui/drawer";

  let exerciseSplits: WithId<ExerciseSplit>[] = [];
  onMount(async () => {
    const response = await fetch("/api/exerciseSplits");
    exerciseSplits = await response.json();
  });
</script>

<h2>Exercise splits</h2>

<div class="h-px flex flex-col grow overflow-y-auto gap-1">
  {#each exerciseSplits as exerciseSplit}
    <a class="btn rounded-md btn-primary h-fit" href="/exerciseSplits/view/{exerciseSplit._id}">
      <div class="flex flex-col gap-1 py-2 w-full">
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">{exerciseSplit.name}</span>
          <span class="font-normal">
            {getTotalSetsOfSplit(exerciseSplit.splitDays)} sets
          </span>
        </div>
        <SplitDaysSchedule splitDays={exerciseSplit.splitDays} />
      </div>
    </a>
  {:else}
    <div class="flex flex-col bg-primary p-2 mb-auto rounded-md">
      <span class="font-semibold text-warning text-lg">No splits created</span>
      <span>Create one by clicking the button below</span>
    </div>
  {/each}
</div>

<Drawer.Root>
  <Drawer.Trigger>
    <Button class="w-full">Create new exercise split</Button>
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Create new exercise split</Drawer.Title>
      <Drawer.Description>Choose an action.</Drawer.Description>
    </Drawer.Header>
    <Drawer.Footer>
      <div class="grid grid-cols-2 gap-2">
        <Button>Use template</Button>
        <Button>Clone older split</Button>
        <Button variant="secondary" class="col-span-2">
          <a href="/exerciseSplits/new" class="w-full">Start from scratch</a>
        </Button>
      </div>
      <Drawer.Close>
        <Button class="w-full" variant="outline">Cancel</Button>
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
