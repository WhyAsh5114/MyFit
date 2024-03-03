<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import Icon from "@iconify/svelte";

  export let idx: number;
  export let exerciseTemplate: ExerciseTemplate;
  export let openEditExercise: (idx: number) => void;
  export let deleteExercise: (idx: number) => void;

  export let startDrag: (e: any) => void;
  export let handleKeyDown: (e: any) => void;
</script>

<div class="flex flex-col p-2 border rounded-md gap-0.5 bg-background/50 backdrop-blur-sm">
  <div class="flex items-center gap-0.5">
    <span class="text-sm mr-auto truncate">{exerciseTemplate.name}</span>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <button
          use:builder.action
          {...builder}
          class="py-0 px-0.5"
          on:mousedown={startDrag}
          on:touchstart={startDrag}
          on:keydown={handleKeyDown}
        >
          <Icon icon="material-symbols:menu" class="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Group>
          <DropdownMenu.Item on:click={() => openEditExercise(idx)}>Edit</DropdownMenu.Item>
          <DropdownMenu.Item class="text-red-500" on:click={() => deleteExercise(idx)}>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
  <div class="flex items-center gap-0.5">
    <span class="text-xs text-muted-foreground mr-auto">
      {exerciseTemplate.sets}
      {exerciseTemplate.setType} sets of {exerciseTemplate.repRangeStart} to {exerciseTemplate.repRangeEnd}
      reps
    </span>
    {#if exerciseTemplate.involvesBodyweight}
      <Badge variant="outline">BW</Badge>
    {/if}
    <Badge class="whitespace-nowrap" variant="secondary">
      {exerciseTemplate.targetMuscleGroup}
    </Badge>
  </div>
</div>
