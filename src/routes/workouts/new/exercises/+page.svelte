<script lang="ts">
	import { days } from "$lib/commonDB";
    import { workoutDay, plannedRIR, weekNumber, muscleTargetsAndSets } from "../newWorkoutStore";
    export let data;

    let todaysDay = days[new Date().getDay()];
</script>

<div class="flex flex-col w-full rounded-md bg-primary p-2">
    <div class="flex justify-between items-center">
        <h2 class="text-white text-xl font-bold">{data.parentMesocycle.splitSchedule[$workoutDay]}</h2>
        <span class="badge badge-secondary font-semibold">{$plannedRIR} RIR</span>
    </div>
    <h3>Week {$weekNumber}, {todaysDay}</h3>
    <div class="flex flex-wrap gap-1 mt-2">
        {#each Object.keys($muscleTargetsAndSets) as muscleTarget}
            <span class="badge badge-error text-black">{muscleTarget}</span>
        {/each}
    </div>
</div>
<div class="grow">

</div>
<button class="btn btn-block btn-accent">
    Finish Workout
</button>
