<script lang="ts">
    import { page } from '$app/stores';
    import ExerciseTable from '$lib/ExerciseTable.svelte';

    let workout = $page.data.user?.workouts[$page.params.workout] as Workout;
    let exercises = workout.exercises;

    const ratingMessages = ['Too easy', 'Easy', 'Just right', 'A bit tough', 'Very tough'];
    const ratingColors = [
        'bg-green-500',
        'bg-lime-500',
        'bg-yellow-500',
        'bg-orange-500',
        'bg-red-500'
    ];

    let currentColor: string;
    $: currentColor = ratingColors[workout.exhaustionRating - 1];

    let hours = Math.floor(workout.duration / 60);
    let mins = workout.duration % 60;
</script>

<div class="stat bg-primary rounded-xl gap-2 max-w-xs">
    <div class="stat-title opacity-100 font-semibold">Difficulty rating</div>
    <div class="rating rating-lg">
        <input
            type="radio"
            name="rating-1"
            class={`mask mask-star ${currentColor}`}
            bind:group={workout.exhaustionRating}
            value={1}
        />
        <input
            type="radio"
            name="rating-1"
            class={`mask mask-star ${currentColor}`}
            bind:group={workout.exhaustionRating}
            value={2}
        />
        <input
            type="radio"
            name="rating-1"
            class={`mask mask-star ${currentColor}`}
            bind:group={workout.exhaustionRating}
            value={3}
            checked
        />
        <input
            type="radio"
            name="rating-1"
            class={`mask mask-star ${currentColor}`}
            bind:group={workout.exhaustionRating}
            value={4}
        />
        <input
            type="radio"
            name="rating-1"
            class={`mask mask-star ${currentColor}`}
            bind:group={workout.exhaustionRating}
            value={5}
        />
    </div>
    <div class="stat-desc opacity-100 text-sm">{ratingMessages[workout.exhaustionRating - 1]}</div>
</div>
<div class="stat bg-primary rounded-xl gap-2 max-w-xs">
    <div class="stat-title opacity-100 font-semibold">Workout duration</div>
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
                    currentTarget.value = "0";
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
                    currentTarget.value = "0";
                }
            }}
        />
    </div>
</div>
<ExerciseTable workoutName={$page.params.workout} {exercises} />
