<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import ExerciseTable from '$lib/ExerciseTable.svelte';
    import MyModal from '$lib/MyModal.svelte';
    import { EditedWorkouts } from '../editSplitStore';

    let modalOpen = false;
    let modalTexts = [''];

    let workout: Exercise[] = JSON.parse(
        JSON.stringify(
            $page.data.user?.splits[$page.params.split].splitWorkouts[$page.params.workout]
        )
    ) as Exercise[];
    if ($page.params.workout in $EditedWorkouts) {
        workout = $EditedWorkouts[$page.params.workout];
    }
    const original_workout = JSON.parse(JSON.stringify(workout));

    async function modifyWorkout() {
        if (workout.length === 0) {
            modalTexts = ["Should have at least one exercise"];
            modalOpen = true;
            return;
        }
        if (original_workout !== workout) {
            $EditedWorkouts[$page.params.workout] = workout;
            await goto(`/records/splits/${$page.params.split}`);
        }
    }
</script>

<MyModal {modalTexts} modalTitle="Error" bind:modalOpen />
<ExerciseTable workoutName={$page.params.workout} bind:exercises={workout} />
<button class="footer-button" on:click={modifyWorkout}>Modify split workout</button>
