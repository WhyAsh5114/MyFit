<script lang="ts">
  import { muscleGroups } from "$lib/types/arrays";
  import { getAverageSetsPerDayOfSplit, getTotalSetsOfSplit } from "$lib/utils/exerciseSplits.js";
  export let exerciseSplit: ExerciseSplit;

  type MuscleGroupStat = {
    muscleGroup: MuscleGroup;
    sets: number;
    frequency: number;
    exerciseVariations: number;
  };

  let currentStat: "sets" | "frequency" | "exerciseVariations" = "sets";

  let muscleGroupStats: MuscleGroupStat[] = [];
  muscleGroups.forEach((muscleGroup) => {
    const stat: MuscleGroupStat = {
      muscleGroup,
      sets: 0,
      frequency: 0,
      exerciseVariations: 0
    };

    const allExercisesForMuscleGroup: Set<string> = new Set();
    for (const splitDay of exerciseSplit.splitDays) {
      if (!splitDay) continue;
      let muscleGroupTargetedThisDay = false;

      for (const exercise of splitDay.exerciseTemplates) {
        if (exercise.targetMuscleGroup === muscleGroup) {
          stat.sets += exercise.sets;
          allExercisesForMuscleGroup.add(exercise.name);
          muscleGroupTargetedThisDay = true;
        }
      }
      if (muscleGroupTargetedThisDay) stat.frequency++;
    }
    stat.exerciseVariations = allExercisesForMuscleGroup.size;
    muscleGroupStats.push(stat);
  });
  muscleGroupStats = muscleGroupStats;

  const maxSets = Math.max(...muscleGroupStats.map((stat) => stat.sets));
  const maxFrequency = Math.max(...muscleGroupStats.map((stat) => stat.frequency));
  const maxExerciseVariations = Math.max(
    ...muscleGroupStats.map((stat) => stat.exerciseVariations)
  );
  const maximums = {
    sets: maxSets,
    frequency: maxFrequency,
    exerciseVariations: maxExerciseVariations
  };
</script>

<div class="stats stats-vertical grid-cols-2 h-fit overflow-y-auto mb-2">
  <div class="stat col-span-2">
    <div class="stat-title">Split name</div>
    <div class="stat-value">{exerciseSplit.name}</div>
  </div>
  <div class="stat">
    <div class="stat-title">Sets per cycle</div>
    <div class="stat-value">{getTotalSetsOfSplit(exerciseSplit.splitDays)}</div>
  </div>
  <div class="stat">
    <div class="stat-title">Avg. sets per day</div>
    <div class="stat-value">
      {getAverageSetsPerDayOfSplit(exerciseSplit.splitDays).toFixed(2)}
    </div>
  </div>
  <div class="stat col-span-2">
    <div class="stat-title">Split metrics</div>
    <div class="join w-full grid grid-cols-3 gap-x-0.5 my-2">
      <input
        name="stat"
        class="join-item btn btn-sm checked:!bg-secondary/80 checked:!text-black"
        aria-label="Sets"
        checked
        type="radio"
        value="sets"
        bind:group={currentStat}
      />
      <input
        name="stat"
        class="join-item btn btn-sm checked:!bg-secondary/80 checked:!text-black"
        aria-label="Frequency"
        type="radio"
        value="frequency"
        bind:group={currentStat}
      />
      <input
        name="stat"
        class="join-item btn btn-sm checked:!bg-secondary/80 checked:!text-black"
        aria-label="Exercise variations"
        type="radio"
        value="exerciseVariations"
        bind:group={currentStat}
      />
    </div>
    <div class="flex flex-col gap-1.5 mt-2 h-48 overflow-y-auto">
      {#each muscleGroupStats.sort((a, b) => b[currentStat] - a[currentStat]) as stat}
        <div class="flex flex-col gap-0.5">
          <div class="flex justify-between text-xs">
            <span>{stat.muscleGroup}</span>
            <span class="font-semibold">{stat[currentStat]}</span>
          </div>
          <progress class="progress" max={maximums[currentStat]} value={stat[currentStat]}
          ></progress>
        </div>
      {/each}
    </div>
  </div>
</div>
