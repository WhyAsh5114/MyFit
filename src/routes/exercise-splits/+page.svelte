<script lang="ts">
  import { onMount } from "svelte";
  import type { WithId } from "mongodb";
  import { Button } from "$lib/components/ui/button";
  import * as Drawer from "$lib/components/ui/drawer";

  let exerciseSplits: WithId<ExerciseSplit>[] = [];
  onMount(async () => {
    const response = await fetch("/api/exercise-splits");
    exerciseSplits = await response.json();
  });
</script>

<h2>Exercise splits</h2>

<div class="h-px flex flex-col grow overflow-y-auto gap-1">
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
