<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
  import { Badge } from "$lib/components/ui/badge";
  import Button from "$lib/components/ui/button/button.svelte";
  import { muscleGroups } from "$lib/types/arrays";
  import { exerciseSplitStore } from "./splitStore";
  import { mode } from "mode-watcher";
  import { Line } from "svelte-chartjs";
  import * as Select from "$lib/components/ui/select";
  import { toast } from "svelte-sonner";
  import Loader2 from "lucide-svelte/icons/loader-2";
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale
  } from "chart.js";
  import { goto, invalidate } from "$app/navigation";

  ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale);
  const sortByOptions = [
    "Volume (descending)",
    "Volume (ascending)",
    "Frequency (descending)",
    "Frequency (ascending)"
  ];
  let selectedSortOption = { value: "Volume (descending)", label: "Volume (descending)" };
  let callingEndpoint = false;

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

  function generateData(muscleGroup: MuscleGroup) {
    return {
      labels: $exerciseSplitStore.splitDays.map((_, idx) => `D${idx + 1}`),
      datasets: [
        {
          label: "Volume",
          data: $exerciseSplitStore.splitDays.map(
            (splitDay) =>
              splitDay?.exerciseTemplates.reduce((setsForDay, exerciseTemplate) => {
                return exerciseTemplate.targetMuscleGroup === muscleGroup
                  ? setsForDay + exerciseTemplate.sets
                  : setsForDay;
              }, 0) ?? 0
          ),
          borderColor: `hsl(0, 0%, ${$mode === "light" ? "20%" : "80%"})`
        }
      ]
    };
  }

  function sortMuscleGroups(sortOption?: string) {
    if (sortOption === "Volume (ascending)") {
      return muscleGroups.toSorted((a, b) => {
        return getTotalSetsOfMuscleGroup(a) - getTotalSetsOfMuscleGroup(b);
      });
    } else if (sortOption === "Frequency (descending)") {
      return muscleGroups.toSorted((a, b) => {
        return getTotalFrequencyOfMuscleGroup(b) - getTotalFrequencyOfMuscleGroup(a);
      });
    } else if (sortOption === "Frequency (ascending)") {
      return muscleGroups.toSorted((a, b) => {
        return getTotalFrequencyOfMuscleGroup(a) - getTotalFrequencyOfMuscleGroup(b);
      });
    }
    return muscleGroups.toSorted((a, b) => {
      return getTotalSetsOfMuscleGroup(b) - getTotalSetsOfMuscleGroup(a);
    });
  }

  async function createExerciseSplit() {
    callingEndpoint = true;
    const response = await fetch("/api/exercise-splits", {
      method: "POST",
      body: JSON.stringify($exerciseSplitStore)
    });
    if (response.ok) {
      toast.success(await response.text());
      await invalidate("/api/exercise-splits");
      await goto("/exercise-splits");
      $exerciseSplitStore = { name: "", splitDays: [] };
    } else {
      toast.error(await response.text());
    }
  }
</script>

<div class="flex flex-col h-full gap-2">
  <div class="flex gap-2 items-center">
    <span class="text-sm font-semibold whitespace-nowrap basis-16 text-center shrink-0"
      >Sort by</span
    >
    <Select.Root portal={null} bind:selected={selectedSortOption}>
      <Select.Trigger class="grow">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each sortByOptions as option}
            <Select.Item value={option} label={option}>{option}</Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
      <Select.Input name="favoriteFruit" />
    </Select.Root>
  </div>
  {#key $exerciseSplitStore}
    <div class="flex flex-col grow gap-2">
      <Accordion.Root class="h-px overflow-y-auto grow px-2 border rounded-md text-sm">
        {#each sortMuscleGroups(selectedSortOption.value) as muscleGroup}
          {@const data = generateData(muscleGroup)}
          <Accordion.Item value={muscleGroup}>
            <Accordion.Trigger>
              <div class="flex w-full px-2 items-center gap-1">
                <span class="mr-auto">{muscleGroup}</span>
                <Badge variant="outline">{getTotalFrequencyOfMuscleGroup(muscleGroup)}x freq</Badge>
                <Badge variant="secondary">{getTotalSetsOfMuscleGroup(muscleGroup)} sets</Badge>
              </div>
            </Accordion.Trigger>
            <Accordion.Content>
              <Line
                {data}
                options={{
                  responsive: true,
                  scales: {
                    y: { min: -0, max: Math.max(...data.datasets[0].data) + 2 }
                  }
                }}
              />
            </Accordion.Content>
          </Accordion.Item>
        {/each}
      </Accordion.Root>
    </div>
  {/key}
  <Button disabled={callingEndpoint} on:click={createExerciseSplit}>
    {#if callingEndpoint}
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
    {/if}
    Create exercise split
  </Button>
</div>
