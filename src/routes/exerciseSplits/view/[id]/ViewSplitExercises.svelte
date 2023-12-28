<script lang="ts">
  import ExerciseSplitTable from "../../ExerciseSplitTable.svelte";
  import SplitDaySelector from "../../SplitDaySelector.svelte";

  export let exerciseSplit: ExerciseSplit;
  let selectedSplitDayIndex: number;
  $: selectedSplitDayExercises = exerciseSplit.splitDays[selectedSplitDayIndex]?.exerciseTemplates;
</script>

<div class="flex flex-col h-px grow overflow-y-auto shadow-xl shadow-black -mt-2">
  <SplitDaySelector exerciseSplitDays={exerciseSplit.splitDays} bind:selectedSplitDayIndex />
  {#if selectedSplitDayExercises}
    <ExerciseSplitTable exerciseTemplates={selectedSplitDayExercises} readOnly />
  {/if}
</div>
