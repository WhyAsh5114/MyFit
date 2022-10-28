<script lang="ts">
    import { page } from "$app/stores";
    import ExerciseTable from "$lib/ExerciseTable.svelte";

    let exercises = $page.data.user?.workouts[$page.params.workout].exercises;
</script>

<ExerciseTable workoutName={$page.params.workout} {exercises} />
