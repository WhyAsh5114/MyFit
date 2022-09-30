<script lang="ts">
    import { page } from "$app/stores";
    import ExerciseTable from "$lib/ExerciseTable.svelte";

    const workout: Exercise[] = $page.data.user?.splits[$page.params.split].splitWorkouts[$page.params.workout] as Exercise[];
    console.log(workout)
</script>

<ExerciseTable workoutName={$page.params.workout} exercises={workout} />
<button class="footer-button">Modify split workout</button>
