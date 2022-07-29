<script context="module" lang="ts">
    export { loadUserOrRedirectToLogin as load } from '$lib/loadUserOrRedirectToLogin';
</script>

<script lang="ts">
    import { scale } from 'svelte/transition';
    export let user: User;

    // Reverse to sort by creation time
    const splits = Object.values(user.splits).reverse();

    function formattedDate(timestamp: number) {
        const date = new Date(timestamp);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
</script>

<div class="flex flex-col w-full max-w-md gap-2">
    {#each splits as split}
        <a
            class="flex flex-col gap-1 bg-primary rounded-lg p-3 active:scale-95 hover:bg-opacity-50 transition-all border-2 {split.name ===
            user.activeSplit
                ? 'border-accent'
                : 'border-base-100'}"
            in:scale
            href="/records/splits/{split.name}"
        >
            <div class="flex w-full">
                <h2 class="text-lg font-semibold">{split.name}</h2>
                <h3 class="ml-auto">
                    {formattedDate(split.timeCreated)}
                </h3>
            </div>
        </a>
    {/each}
</div>
