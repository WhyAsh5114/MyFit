<script lang="ts">
    import { page } from '$app/stores';
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
                    class="flex flex-col w-full bg-primary rounded-lg px-3 py-2 my-1.5 active:scale-95 hover:bg-opacity-50 transition-all"
                >
                    <h2 class="text-lg">
                        {workout}
                    </h2>
                    <div class="flex">
                        {#if $page.data.user?.workouts[workout].belongsToSplit}
                            <p class="font-semibold text-accent">{$page.data.user?.workouts[workout].belongsToSplit} -> {$page.data.user?.workouts[workout].workoutType}</p>
                        {:else}
                            <p class="font-semibold">N/A</p>
                        {/if}
                    </div>
                </a>
            {/each}
        </ul>
    {/if}
</div>
