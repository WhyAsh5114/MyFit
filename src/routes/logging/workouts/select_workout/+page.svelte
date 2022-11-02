<script lang="ts">
    import { page } from '$app/stores';
    import { scale } from 'svelte/transition';
    import { SetSplit, SetWorkoutType } from '../newWorkoutStore';

    const ratingColors = [
        'text-green-500',
        'text-lime-500',
        'text-yellow-500',
        'text-orange-500',
        'text-red-500'
    ];
</script>

<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/logging">Logging</a></li>
        <li><a href="/logging/workouts">Workouts</a></li>
        <li>Select template</li>
    </ul>
</div>
<div class="flex flex-col w-full max-w-md px-3 h-px flex-auto overflow-y-auto">
    {#if Object.keys($page.data.user?.workouts || {}).length === 0}
        <div class="my-auto flex flex-col items-center">
            <p>No workouts found</p>
            <p>Create new or use a split template</p>
            <a class="btn btn-primary mt-2 w-full" href="/logging/workouts">Back</a>
        </div>
    {:else}
        <ul class="my-auto flex flex-col">
            {#each Object.keys($page.data.user?.workouts || {}).reverse() as workout}
                <a
                    href="/logging/workouts/overload?template={workout}"
                    class="flex w-full bg-primary rounded-lg px-3 py-2 my-1.5 active:scale-95 hover:bg-opacity-50 transition-all"
                    in:scale
                    on:click={() => {
                        $SetSplit = $page.data.user?.workouts[workout].belongsToSplit || '';
                        $SetWorkoutType = $page.data.user?.workouts[workout].workoutType || '';
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
            {/each}
        </ul>
    {/if}
</div>
