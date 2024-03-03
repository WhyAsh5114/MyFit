<script lang="ts">
  import { onMount } from "svelte";
  import type { WithId } from "mongodb";
  import { Button } from "$lib/components/ui/button";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Badge } from "$lib/components/ui/badge";
  import { getTotalSetsOfSplit } from "$lib/utils/exerciseSplits";
  import { Skeleton } from "$lib/components/ui/skeleton";

  let exerciseSplits: WithId<ExerciseSplit>[];
  onMount(async () => {
    try {
      const response = await fetch("/api/exercise-splits");
      exerciseSplits = await response.json();
    } catch (error) {
      exerciseSplits = [];
    }
  });
</script>

<h2>Exercise splits</h2>

<div class="h-px flex flex-col grow overflow-y-auto gap-1">
  {#if exerciseSplits}
    {#each exerciseSplits as exerciseSplit}
      <div class="border p-2 rounded-md flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">{exerciseSplit.name}</span>
          <Badge>{getTotalSetsOfSplit(exerciseSplit.splitDays)} sets</Badge>
        </div>
        <div class="flex w-full flex-wrap gap-1">
          {#each exerciseSplit.splitDays as splitDay}
            <Badge variant={splitDay ? "secondary" : "outline"}>
              {splitDay?.name ?? "Rest"}
            </Badge>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    {#each Array(5) as i}
      <div class="border p-2 rounded-md flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <Skeleton class="h-7 w-28" />
          <Skeleton class="h-[22px] w-16 rounded-full" />
        </div>
        <div class="flex w-full flex-wrap gap-1">
          {#each Array(7) as j}
            <Skeleton class="h-[22px] w-16 rounded-full" />
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

<Drawer.Root>
  <Drawer.Trigger asChild let:builder>
    <Button builders={[builder]} class="w-full">Create new exercise split</Button>
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
          <a href="/exercise-splits/new" class="w-full">Start from scratch</a>
        </Button>
      </div>
      <Drawer.Close asChild let:builder>
        <Button builders={[builder]} class="w-full" variant="outline">Cancel</Button>
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
