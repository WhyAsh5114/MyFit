<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';
    import MyModal from '$lib/MyModal.svelte';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import { WorkoutName, WorkoutCreatedDate, WorkoutExercises, SetSplit, SetWorkoutType } from '../newWorkoutStore';

    onMount(() => {
        if (!$WorkoutName || !$WorkoutCreatedDate || !WorkoutExercises) {
            goto('/logging/workouts');
        }
    });

    const ratingMessages = ['Too easy', 'Easy', 'Just right', 'A bit tough', 'Very tough'];
    const ratingColors = [
        'bg-green-500',
        'bg-lime-500',
        'bg-yellow-500',
        'bg-orange-500',
        'bg-red-500'
    ];

    let hours: number;
    let mins: number;
    if ($WorkoutCreatedDate) {
        const now = new Date();
        let diff = new Date(now.getTime() - $WorkoutCreatedDate.getTime());
        mins = Math.floor(diff.getTime() / 60000);
        hours = Math.floor(mins / 60);
        mins = mins % 60;
        if (hours < 0 || mins < 0) {
            hours = 0;
            mins = 0;
        }
    }

    let currentRating = 3;
    let currentColor: string;
    $: currentColor = ratingColors[currentRating - 1];

    let addingToSplit = $page.data.user?.activeSplit !== undefined;
    let selectedSplit = $page.data.user?.activeSplit;
    if ($SetSplit !== '' && $SetSplit) {
        selectedSplit = $SetSplit;
    }

    let uniqueWorkouts: string[] = [];
    $: if (selectedSplit) {
        uniqueWorkouts =
            Array.from(new Set($page.data.user?.splits[selectedSplit]?.schedule)) || [];
        uniqueWorkouts = uniqueWorkouts.filter((workout) => workout !== 'Rest');
    }

    let selectedWorkout: string;
    if ($SetWorkoutType !== '' && $SetWorkoutType) {
        selectedWorkout = $SetWorkoutType;
    } else if (selectedSplit && addingToSplit) {
        selectedWorkout = $page.data.user?.splits[selectedSplit].schedule.at(
            new Date().getDay() - 1
        ) as string;
        if (selectedWorkout === 'Rest') {
            selectedWorkout = uniqueWorkouts[0];
        }
    }

    let modalOpen = false;
    let modalTitle = '';
    let modalTexts: string[] = [];
    let onClose = () => {};
    async function saveWorkout() {
        let workout: Workout = {
            name: $WorkoutName,
            createdDate: $WorkoutCreatedDate,
            exercises: $WorkoutExercises,
            belongsToSplit: addingToSplit ? selectedSplit : undefined,
            workoutType: addingToSplit ? selectedWorkout : undefined,
            exhaustionRating: currentRating,
            duration: hours * 60 + mins
        };
        const res = await fetch('/api/workouts/saveWorkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                workout
            })
        });
        if (res.ok) {
            $WorkoutName = '';
            $WorkoutCreatedDate = new Date(0);
            $WorkoutExercises = [];
            modalTitle = 'Success';
            modalTexts = ['Workout saved successfully'];
            onClose = async () => {
                await invalidateAll();
                await goto('/');
            };
            modalOpen = true;
        } else {
            const body = await res.text();
            modalTitle = 'Error';
            modalTexts = [body];
            modalOpen = true;
            onClose = () => {};
        }
    }
</script>

<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/logging">Logging</a></li>
        <li><a href="/logging/workouts">Workouts</a></li>
        <li>New</li>
        <li>Options</li>
    </ul>
</div>
<MyModal bind:modalOpen {modalTitle} {modalTexts} {onClose} />
<div class="flex flex-col my-auto items-center gap-2 w-full max-w-xs">
    <div class="stat bg-primary rounded-xl gap-2">
        <div class="stat-title opacity-100 font-semibold">Difficulty rating</div>
        <div class="rating rating-lg">
            <input
                type="radio"
                name="rating-1"
                class={`mask mask-star ${currentColor}`}
                bind:group={currentRating}
                value={1}
            />
            <input
                type="radio"
                name="rating-1"
                class={`mask mask-star ${currentColor}`}
                bind:group={currentRating}
                value={2}
            />
            <input
                type="radio"
                name="rating-1"
                class={`mask mask-star ${currentColor}`}
                bind:group={currentRating}
                value={3}
                checked
            />
            <input
                type="radio"
                name="rating-1"
                class={`mask mask-star ${currentColor}`}
                bind:group={currentRating}
                value={4}
            />
            <input
                type="radio"
                name="rating-1"
                class={`mask mask-star ${currentColor}`}
                bind:group={currentRating}
                value={5}
            />
        </div>
        <div class="stat-desc opacity-100 text-sm">{ratingMessages[currentRating - 1]}</div>
    </div>
    <div class="stats stats-vertical w-full max-w-xs">
        <div
            class={`stat bg-primary gap-2 ${
                Object.keys($page.data.user?.splits || {}).length === 0 ? 'my-disabled-button' : ''
            }`}
        >
            <div class="stat-title opacity-100 font-semibold">Add to split</div>
            <div class="flex place-items-center justify-between">
                <input
                    type="checkbox"
                    class="checkbox checkbox-accent"
                    bind:checked={addingToSplit}
                />
                <select
                    class="select select-sm w-56 text-ellipsis overflow-clip"
                    bind:value={selectedSplit}
                >
                    {#if Object.keys($page.data.user?.splits || {}).length === 0}
                        <option>No split created</option>
                    {:else}
                        {#each Object.keys($page.data.user?.splits || {}) as split}
                            <option>{split}</option>
                        {/each}
                    {/if}
                </select>
            </div>
        </div>
        {#if addingToSplit}
            <div class="stat bg-primary gap-2" transition:slide|local>
                <div class="stat-title opacity-100 font-semibold">Split workout type</div>
                <div class="flex place-items-center justify-between">
                    <select
                        class="select select-sm w-full text-ellipsis overflow-clip"
                        bind:value={selectedWorkout}
                    >
                        {#each uniqueWorkouts as workout}
                            <option>{workout}</option>
                        {/each}
                    </select>
                </div>
            </div>
        {/if}
    </div>
    <div class="stat bg-primary rounded-xl gap-2">
        <div class="stat-title opacity-100 font-semibold">Workout duration</div>
        <div class="flex w-full">
            <div class="flex items-center gap-3 rounded-lg grow">
                <input
                    class="w-full text-center text-lg text-accent font-semibold bg-base-100 focus:outline-0 rounded-lg px-0.5"
                    type="number"
                    min="0"
                    max="23"
                    bind:value={hours}
                    on:focusout={function focusout({ currentTarget }) {
                        if (
                            currentTarget.value.trim() === '' ||
                            isNaN(parseInt(currentTarget.value)) ||
                            parseInt(currentTarget.value) < 0
                        ) {
                            currentTarget.value = hours.toString();
                        }
                    }}
                />
                <p class="text-3xl font-bold">:</p>
                <input
                    class="w-full text-center text-lg text-accent font-semibold bg-base-100 rounded-lg focus:outline-0"
                    type="number"
                    min="0"
                    max="59"
                    bind:value={mins}
                    on:focusout={function focusout({ currentTarget }) {
                        if (
                            currentTarget.value.trim() === '' ||
                            isNaN(parseInt(currentTarget.value)) ||
                            parseInt(currentTarget.value) < 0 ||
                            parseInt(currentTarget.value) > 59
                        ) {
                            currentTarget.value = mins.toString();
                        }
                    }}
                />
            </div>
        </div>
    </div>
</div>
<button class="footer-button" on:click={saveWorkout}>Save workout</button>
