<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
    import { Badge } from "$lib/components/ui/badge";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Progress } from "$lib/components/ui/progress";
  import { muscleGroups } from "$lib/types/arrays";
  import { exerciseSplitStore } from "./splitStore";

  function getTotalSetsOfMuscleGroup(muscleGroup: MuscleGroup) {
    return $exerciseSplitStore.splitDays.reduce((totalSets, splitDay) => {
      if (!splitDay) return totalSets;
      return (
        totalSets +
        splitDay.exerciseTemplates.reduce((setsForDay, exerciseTemplate) => {
          return exerciseTemplate.targetMuscleGroup === muscleGroup
            ? setsForDay + exerciseTemplate.sets
            : setsForDay;
        }, 0)
      );
    }, 0);
  }

  function getTotalFrequencyOfMuscleGroup(muscleGroup: MuscleGroup) {
    return $exerciseSplitStore.splitDays.reduce((totalFrequency, splitDay) => {
      if (!splitDay) return totalFrequency;
      return splitDay.exerciseTemplates.filter(
        (exerciseTemplate) => exerciseTemplate.targetMuscleGroup === muscleGroup
      ).length > 0
        ? totalFrequency + 1
        : totalFrequency;
    }, 0);
  }
</script>

{#key $exerciseSplitStore}
  <div class="flex flex-col h-full gap-2">
    <Accordion.Root class="h-px overflow-y-auto grow px-2 border rounded-md text-sm">
      {#each muscleGroups as muscleGroup}
        <Accordion.Item value={muscleGroup}>
          <Accordion.Trigger>
            <div class="flex w-full px-2 items-center gap-1">
              <span class="mr-auto">{muscleGroup}</span>
              <Badge variant="outline">{getTotalFrequencyOfMuscleGroup(muscleGroup)}x freq</Badge>
              <Badge variant="secondary">{getTotalSetsOfMuscleGroup(muscleGroup)} sets</Badge>
            </div>
          </Accordion.Trigger>
          <Accordion.Content>
            <Progress class="w-1/2 h-2 mb-1" value={33} />
            <Progress class="w-1/2 h-2" value={45} />
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
    <Button>Save exercise split</Button>
  </div>
{/key}
