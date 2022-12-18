<script lang="ts">
    import { page } from '$app/stores';
    import MyModal from '$lib/MyModal.svelte';
    import { getFormattedDate } from '$lib/usefulFunctions';
    import { scale, fly, slide } from 'svelte/transition';
    import { SetSplit, SetWorkoutType } from '../newWorkoutStore';

    const user = $page.data.user;
    // Reverse to sort by creation time (or last update time)
    const splits = Object.values(user?.splits as Record<string, Split>).reverse() as Split[];

    const ratingColors = [
        'text-green-500',
        'text-lime-500',
        'text-yellow-500',
        'text-orange-500',
        'text-red-500'
    ];

    let currentSplit: string;
    let selectingWorkouts = false;

    let todaysWorkout: string | undefined;
    let workoutWithType: string[];
    $: workoutWithType = Object.keys($page.data.user?.workouts || {}).filter((workoutName) => {
        const workout = $page.data.user?.workouts[workoutName];
        return workout?.workoutType === todaysWorkout && workout?.belongsToSplit === currentSplit;
    });

    $: changeTodaysWorkout(currentSplit);
    function changeTodaysWorkout(splitName: string) {
        const split = $page.data.user?.splits[splitName];
        if (split) {
            todaysWorkout = split.schedule.at(new Date().getDay() - 1);
            if (todaysWorkout === 'Rest') {
                todaysWorkout = undefined;
            }
        }
    }

    let modalOpen = false;
    let modalTitle = 'Help';
    let modalTexts: string[];
    $: modalTexts = selectingWorkouts
        ? [
              'Base split workout is the workout which was set when you created the split',
              'The workouts below it are workouts performed with the same split and workout type'
          ]
        : [
              'First select the split which you want to perform',
              'Active split will be highlighted with a blue border'
          ];
</script>

<!-- TODO: Sort workouts by date -->
<MyModal bind:modalOpen {modalTitle} {modalTexts} />
<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/logging">Logging</a></li>
        <li><a href="/logging/workouts">Workouts</a></li>
        <li>Template</li>
    </ul>
</div>
<div class="flex flex-col items-center">
    <button
        class="modal-help-button"
        on:click={() => {
            modalOpen = true;
        }}>?</button
    >
    <div class="btn-group grid grid-cols-2 my-3">
        <button
            class="font-semibold btn btn-sm normal-case {selectingWorkouts ? '' : 'btn-active'}"
            on:click={() => {
                selectingWorkouts = false;
            }}>1. Select split</button
        >
        <button class="font-semibold btn btn-sm normal-case {selectingWorkouts ? 'btn-active' : ''}"
            >2. Select workout</button
        >
    </div>
</div>
{#if !selectingWorkouts}
    <div
        class="flex flex-col w-full max-w-md px-3 h-px flex-auto overflow-y-auto"
        in:fly|local={{ x: -200 }}
    >
        <ul data-test-id="splits-list" class="my-auto">
            {#each splits as split}
                <button
                    class="flex w-full bg-primary rounded-lg p-3 my-1.5 active:scale-95 hover:bg-opacity-50 transition-all border-2 {split.name ===
                    user?.activeSplit
                        ? 'border-accent'
                        : 'border-base-100'}"
                    in:scale|local
                    on:click={() => {
                        currentSplit = split.name;
                        selectingWorkouts = true;
                        todaysWorkout =
                            $page.data.user?.splits[currentSplit]?.schedule.at(
                                new Date().getDay() - 1
                            ) || '';
                    }}
                >
                    <h2
                        class="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                        {split.name}
                    </h2>
                    <h3 class="ml-auto basis-28 text-right shrink-0">
                        {getFormattedDate(split.timeCreated)}
                    </h3>
                </button>
            {/each}
        </ul>
        {#if splits.length === 0}
            <div class="flex flex-grow flex-col justify-center items-center gap-3">
                <h2 class="text-center" data-test-id="no-split-label">No split created</h2>
                <a
                    href="/splits/new"
                    class="btn btn-primary w-full"
                    data-test-id="create-split-button">Create split</a
                >
            </div>
        {/if}
    </div>
{:else}
    <div class="flex flex-col w-full max-w-md px-3">
        <div class="stat bg-primary rounded-xl gap-2">
            <div class="stat-title opacity-100">
                Select workout from <b class="text-accent">{currentSplit}</b>
            </div>
            <select class="select select-sm" bind:value={todaysWorkout}>
                {#each Array.from(new Set($page.data.user?.splits[currentSplit].schedule)).filter((item) => item !== 'Rest') || [] as workout}
                    <option>{workout}</option>
                {/each}
            </select>
        </div>
        <a
            class="flex w-full bg-primary rounded-lg px-3 py-2 my-1.5 active:scale-95 hover:bg-opacity-50 transition-all"
            href="/logging/workouts/overload?split={currentSplit}&type={todaysWorkout}"
            on:click={() => {
                $SetSplit = currentSplit;
                $SetWorkoutType = todaysWorkout || '';
            }}
        >
            <h2 class="text-lg">
                {currentSplit} -> {todaysWorkout}
            </h2>
            <p class="font-semibold ml-auto">Base split workout</p>
        </a>
    </div>
    <div
        in:fly|local={{ x: 200 }}
        class="flex flex-col w-full max-w-md px-3 h-px flex-auto overflow-y-auto"
    >
        {#if workoutWithType.length > 0}
            <ul class="my-auto flex flex-col">
                {#each Object.keys($page.data.user?.workouts || {})
                    .sort()
                    .reverse() as workout}
                    {#if $page.data.user?.workouts[workout].belongsToSplit === currentSplit && $page.data.user?.workouts[workout].workoutType === todaysWorkout}
                        <a
                            class="flex w-full bg-primary rounded-lg px-3 py-2 my-1.5 active:scale-95 hover:bg-opacity-50 transition-all"
                            in:slide|local
                            href="/logging/workouts/overload?template={workout}&split={currentSplit}&type={todaysWorkout}"
                            on:click={() => {
                                $SetSplit = currentSplit;
                                $SetWorkoutType = todaysWorkout || '';
                            }}
                        >
                        <div class="flex flex-col">
                            <h2 class="text-lg">
                                {workout}
                            </h2>
                            <div class="flex">
                                {#if $page.data.user?.workouts[workout].belongsToSplit}
                                    <p class="font-semibold text-accent">
                                        {$page.data.user?.workouts[workout].belongsToSplit} -> {$page
                                            .data.user?.workouts[workout].workoutType}
                                    </p>
                                {:else}
                                    <p class="font-semibold">N/A</p>
                                {/if}
                            </div>
                        </div>
                        <div
                            class="flex items-center ml-auto text-xl font-semibold {$page.data.user
                                ?.workouts[workout].exhaustionRating
                                ? ratingColors.at(
                                      $page.data.user?.workouts[workout].exhaustionRating - 1
                                  )
                                : 'text-white'}"
                        >
                            <span class="text-2xl">★&nbsp;</span>
                            {$page.data.user?.workouts[workout].exhaustionRating}
                        </div>
                        </a>
                    {/if}
                {/each}
            </ul>
        {:else}
            <p class="m-auto">
                No workout with type <span class="text-accent font-semibold">{todaysWorkout}</span>
                belonging to split <span class="text-accent font-semibold">{currentSplit}</span> found
            </p>
        {/if}
    </div>
{/if}
