<script>
    import { page } from "$app/stores";

    const msg = $page.error.message;
    const split = msg.split('\t')[0];
    let missingWorkout;
    if (msg.split('\t').length > 0) {
        missingWorkout = msg.split('\t')[1];
    }
</script>

<div class="flex flex-col flex-grow justify-center center">
    <h1 class="text-red-500 text-4xl font-bold">Error</h1>
    <h3 class="text-2xl font-semibold">404</h3>
    {#if missingWorkout}
        <p>Workout <b>{missingWorkout}</b> not found in split <b>{split}</b></p>
    {:else}
        <p>Split <b>{split}</b> not found</p>
    {/if}
    <div class="h-px w-full bg-gray-200 my-4" />
    <h3 class="mb-1">Other useful links:</h3>
    <div class="flex gap-2 w-full">
        <a class="btn btn-primary btn-md" href="/records/splits">Split records</a>
        {#if missingWorkout}
            <a class="btn btn-primary btn-md grow normal-case" href={`/records/splits/${split}`}>{split}</a>
        {/if}
    </div>
</div>
