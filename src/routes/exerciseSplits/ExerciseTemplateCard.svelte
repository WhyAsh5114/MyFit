<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import Icon from "@iconify/svelte";

  export let idx: number;
  export let exerciseTemplate: ExerciseTemplate;
  export let openEditExercise: (idx: number) => void;
</script>

<div class="flex flex-col p-2 border rounded-md gap-0.5">
  <div class="flex items-center gap-0.5">
    <span class="text-sm mr-auto truncate">{exerciseTemplate.exerciseName}</span>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button class="py-0 px-0.5 h-fit" variant="ghost">
          <Icon icon="material-symbols:menu" class="w-4 h-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Group>
          <DropdownMenu.Item on:click={() => openEditExercise(idx)}>Edit</DropdownMenu.Item>
          <DropdownMenu.Item class="text-red-500">Delete</DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
  <div class="flex items-center">
    <span class="text-xs text-muted-foreground mr-auto">
      {exerciseTemplate.sets}
      {exerciseTemplate.setType} sets of {exerciseTemplate.repRangeStart} to {exerciseTemplate.repRangeEnd}
      reps
    </span>
    {#if exerciseTemplate.involvesBodyweight}
      <Badge variant="secondary">BW</Badge>
    {/if}
    <Badge class="whitespace-nowrap">{exerciseTemplate.targetMuscleGroup}</Badge>
  </div>
</div>
