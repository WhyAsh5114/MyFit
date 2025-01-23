<script lang="ts">
  import { getTotalDuration } from "$lib/util/MesocycleTemplate";
  export let activeMesocycleTemplate: MesocycleTemplate;
  export let activeMesocycle: WithSerializedId<ActiveMesocycle>;

  let totalCycles: number;
  let totalWorkouts: number;
  const totalNonRestDays = activeMesocycleTemplate.exerciseSplit.filter(
    (split) => split !== null
  ).length;
  totalCycles = getTotalDuration(activeMesocycleTemplate.RIRProgression);
  totalWorkouts = totalCycles * totalNonRestDays;

  let totalWorkoutsPerformed = 0;
  activeMesocycle.workouts.forEach((workout) => {
    if (workout !== null) totalWorkoutsPerformed++;
  });
</script>

<a class="btn btn-primary rounded-md h-fit p-2" href="/mesocycles/view/{activeMesocycle.id}">
  <div class="grid grid-cols-3 place-items-center w-full gap-2">
    <span class="font-semibold text-lg text-secondary text-left col-span-2">
      {activeMesocycleTemplate.name}
    </span>
    <span class="row-span-2 font-normal">
      {totalWorkoutsPerformed}/{totalWorkouts} workouts completed
    </span>
    <progress
      class="progress progress-accent col-span-2"
      max={totalWorkouts}
      value={totalWorkoutsPerformed}
    />
  </div>
</a>
