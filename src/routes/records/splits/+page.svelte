<script lang="ts">
    import Breadcrumbs from '$lib/Breadcrumbs.svelte';
    import { getFormattedDate } from '$lib/usefulFunctions';
    import { scale } from 'svelte/transition';
    import { page } from '$app/stores';

    const user = $page.data.user;
    // Reverse to sort by creation time
    const splits = Object.values(user.splits).reverse() as Split[];
</script>

<Breadcrumbs>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/records">Records</a></li>
        <li>Splits</li>
    </ul>
</Breadcrumbs>
<div class="flex flex-col w-full max-w-md gap-2 items-center justify-center flex-grow">
    {#each splits as split}
        <a
            class="flex flex-col w-full gap-1 bg-primary rounded-lg p-3 active:scale-95 hover:bg-opacity-50 transition-all border-2 {split.name ===
            user.activeSplit
                ? 'border-accent'
                : 'border-base-100'}"
            in:scale
            href="/records/splits/{split.name}"
        >
            <div class="flex w-full">
                <h2 class="text-lg font-semibold">{split.name}</h2>
                <h3 class="ml-auto">
                    {getFormattedDate(split.timeCreated)}
                </h3>
            </div>
        </a>
    {/each}
    {#if splits.length === 0}
        <h2 class="text-center">No split created</h2>
        <a href="/splits/new" class="btn btn-primary w-44 normal-case">Create split</a>
    {/if}
</div>
