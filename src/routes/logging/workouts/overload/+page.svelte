<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import ExerciseTable from '$lib/ExerciseTable.svelte';
    import MyModal from '$lib/MyModal.svelte';
    import { colors } from '$lib/usefulFunctions';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { OldWorkoutExercises, WorkoutExercises } from '../newWorkoutStore';

    let currentWorkout: Exercise[];
    let newWorkout: Exercise[];
    let workoutName: string;
    let overload: string;

    let splitName: string | null;
    let splitWorkout: string | null;
    onMount(() => {
        const templateParam = $page.url.searchParams.get('template');
        if (!templateParam) {
            splitName = $page.url.searchParams.get('split');
            splitWorkout = $page.url.searchParams.get('type');
            if (!splitName || !splitWorkout) {
                goto('/logging/workouts');
                return;
            }
            if (!$page.data.user?.splits[splitName].splitWorkouts[splitWorkout]) {
                goto('/logging/workouts');
                return;
            }
            currentWorkout = $page.data.user?.splits[splitName].splitWorkouts[splitWorkout];
            workoutName = splitName + '->' + splitWorkout;
        } else {
            if (!$page.data.user?.workouts[templateParam]) {
                goto('/logging/workouts');
                return;
            }
            currentWorkout = $page.data.user?.workouts[templateParam].exercises;
            workoutName = $page.data.user?.workouts[templateParam].name;
        }
    });

    // Progression stuff
    let progressionValue = 5;
    let meanOverload: number;
    $: meanOverload = 1 * progressionValue;
    let textColor = 'text-white';

    $: if (meanOverload !== undefined) {
        let closestColors = colors.get(25);
        if (closestColors) {
            for (let [overload, maybeColors] of colors) {
                if (overload >= meanOverload) {
                    closestColors = maybeColors;
                    break;
                }
            }
            textColor = closestColors[0];
        }
    }

    $: if (currentWorkout) {
        // Overloading part
        newWorkout = JSON.parse(JSON.stringify(currentWorkout));
        let allOverloads: number[] = [];
        newWorkout.forEach((exercise) => {
            if (progressionValue === 0) {
                return;
            }
            let originalExercise: Exercise | undefined;
            splitName = $page.url.searchParams.get('split');
            splitWorkout = $page.url.searchParams.get('type');
            if (splitName && splitWorkout) {
                const originalWorkout =
                    $page.data.user?.splits[splitName].splitWorkouts[splitWorkout];
                const splitExercise = originalWorkout?.find(
                    (originalExercise) => originalExercise.name === exercise.name
                );
                originalExercise = splitExercise;
            }
            let closestPercentage: number | undefined;
            let reps_change = 0;
            let sets_change = 0;
            let load_change = 0;
            for (let j = 0; j <= 1; j++) {
                const rep_range = Math.round((originalExercise?.reps || exercise.reps) / 5);
                for (let i = rep_range; i >= -rep_range; i--) {
                    let oldProgressionPositive: undefined | number;
                    for (let k = 0; k >= -1; k++) {
                        let new_volume;
                        if (originalExercise) {
                            new_volume =
                                (originalExercise.reps + i) *
                                (originalExercise.sets + j) *
                                (exercise.load + k * 2.5);
                        } else {
                            new_volume =
                                (exercise.reps + i) *
                                (exercise.sets + j) *
                                (exercise.load + k * 2.5);
                        }
                        const volume = exercise.reps * exercise.sets * exercise.load;
                        const progression = (new_volume / volume) * 100 - 100;
                        const overallValueShift =
                            (Math.abs(i) ** 2 / exercise.reps +
                                Math.abs(j) ** 2 / exercise.sets +
                                Math.abs(k) ** 2 / exercise.load) *
                            100;
                        if (
                            (!closestPercentage ||
                                Math.abs(progression - progressionValue) <
                                    Math.abs(closestPercentage - progressionValue)) &&
                            overallValueShift <= 60
                        ) {
                            closestPercentage = progression;
                            reps_change = i;
                            sets_change = j;
                            load_change = k;
                        } else if (
                            !oldProgressionPositive ||
                            Math.abs(oldProgressionPositive - progressionValue) >
                                Math.abs(progression - progressionValue)
                        ) {
                            oldProgressionPositive = progression;
                        } else {
                            break;
                        }
                    }
                    for (let k = -1; k < 0; k--) {
                        let new_volume;
                        if (originalExercise) {
                            new_volume =
                                (originalExercise.reps + i) *
                                (originalExercise.sets + j) *
                                (exercise.load + k * 2.5);
                        } else {
                            new_volume =
                                (exercise.reps + i) *
                                (exercise.sets + j) *
                                (exercise.load + k * 2.5);
                        }

                        const volume = exercise.reps * exercise.sets * exercise.load;
                        const progression = (new_volume / volume) * 100 - 100;
                        const overallValueShift =
                            (Math.abs(i) ** 2 / exercise.reps +
                                Math.abs(j) ** 2 / exercise.sets +
                                Math.abs(k) ** 2 / exercise.load) *
                            100;
                        if (
                            (!closestPercentage ||
                                Math.abs(progression - progressionValue) <
                                    Math.abs(closestPercentage - progressionValue)) &&
                            overallValueShift <= 60
                        ) {
                            closestPercentage = progression;
                            reps_change = i;
                            sets_change = j;
                            load_change = k;
                        } else {
                            break;
                        }
                    }
                }
            }
            exercise.reps += reps_change;
            exercise.sets += sets_change;
            exercise.load += load_change * 2.5;
            if (originalExercise) {
                exercise.reps = originalExercise.reps + reps_change;
                exercise.sets = originalExercise.sets + sets_change;
            }
            allOverloads.push(closestPercentage || 0);
        });
        let newVolume = 0;
        newWorkout.forEach(exercise => {
            newVolume += exercise.reps * exercise.sets * exercise.load;
        });

        let oldVolume = 0;
        currentWorkout.forEach(exercise => {
            oldVolume += exercise.reps * exercise.sets * exercise.load;
        })

        overload = ((newVolume / oldVolume) * 100 - 100).toFixed(2);
    }

    function applyOverload() {
        $WorkoutExercises = JSON.parse(JSON.stringify(newWorkout));
        $OldWorkoutExercises = JSON.parse(JSON.stringify(currentWorkout));
        goto('/logging/workouts/new');
    }

    function dontOverload() {
        $WorkoutExercises = JSON.parse(JSON.stringify(currentWorkout));
        $OldWorkoutExercises = JSON.parse(JSON.stringify(currentWorkout));
        goto('/logging/workouts/new');
    }

    let modalOpen = false;
    let modalTitle = 'Help';
    let modalTexts = [
        'The overloaded workout is just a starting point for you',
        'You can tweak the workout later according to your preferences',
        'As the overload values get bigger, it becomes difficult for the program to get decent values, try using smaller overloads for better values',
        'Again, this is just a reference, you can change it according to your preferences after applying the overload',
        "You can also skip auto-overloading and manually overload the workout on the next screen by clicking 'Don't overload'"
    ];
</script>

<MyModal bind:modalOpen {modalTexts} {modalTitle} />
<div class="flex w-full max-w-sm items-center gap-3">
    <div class="stat mx-auto max-w-xs bg-primary rounded-lg mt-3">
        <label class="stat-title font-semibold text-lg opacity-95" for="progression-range-input"
            >Progression</label
        >
        {#key progressionValue}
            <div
                class="stat-value text-4xl transition-colors {textColor} mb-1"
                in:fly={{ duration: 150, y: 25 }}
            >
                {progressionValue}%
            </div>
        {/key}
        <input
            type="range"
            class="range range-xs range-secondary"
            max="25"
            step="2.5"
            id="progression-range-input"
            data-test-id="progression-range-input"
            bind:value={progressionValue}
        />
    </div>
    <button class="modal-help-button" on:click={() => (modalOpen = true)}>?</button>
</div>
<div class="flex flex-col md:flex-row h-full w-full md:gap-3 justify-center">
    <ExerciseTable workoutName="Original" readonly={true} bind:exercises={currentWorkout} />
    <ExerciseTable
        workoutName="With overload ({overload}%)"
        readonly={true}
        bind:exercises={newWorkout}
    />
</div>
<!-- TODO: Suggest overloading according to split specifics... -->
<!-- TODO: Have the options to not change reps/sets/load -->
<!-- TODO: Have the options to only increase/decrease reps/sets/load -->
<div class="grid grid-cols-2 gap-4 w-full">
    <button
        class="btn btn-primary grow md:text-lg normal-case bg-accent text-black"
        on:click={applyOverload}>Apply overload</button
    >
    <button
        class="btn btn-primary grow md:text-lg normal-case bg-error text-white"
        on:click={dontOverload}>Don't overload</button
    >
</div>
