<script lang="ts">
    import { getFormattedDate } from '$lib/usefulFunctions';
    import { scale } from 'svelte/transition';
    import { page } from '$app/stores';
    import { CurrentSplit, CurrentSplitOriginalName } from './[split]/editSplitStore';
    import MyModal from '$lib/MyModal.svelte';

    let modalTitle = '';
    let modalTexts: string[] = [];
    let modalOpen = false;

    const user = $page.data.user;
    // Reverse to sort by creation time (or last update time)
    const splits = Object.values(user?.splits as Record<string, Split>).reverse() as Split[];

    function clearStores(name: string) {
        if (
            $CurrentSplitOriginalName !== name ||
            $CurrentSplit.timeCreated !== $page.data.user?.splits[name].timeCreated
        ) {
            $CurrentSplitOriginalName = undefined;
        }
    }

    let modifiedSplit: string;
    if ($CurrentSplitOriginalName) {
        if (
            JSON.stringify($page.data.user?.splits[$CurrentSplitOriginalName]) !==
            JSON.stringify($CurrentSplit)
        ) {
            modifiedSplit = $CurrentSplitOriginalName;
        }
    }

    function openHelpModal() {
        modalTitle = 'Help';
        modalTexts = [
            'A split with a blue border is the active split',
            'A split with yellow and underlined text has unsaved changes',
            'Unsaved changes to a split will be lost when refreshing the page or going to a different split'
        ];
        modalOpen = true;
    }
</script>

<svelte:head>
    <title>MyFit | Records</title>
</svelte:head>
<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/records">Records</a></li>
        <li>Splits</li>
    </ul>
</div>
<button
    class="modal-help-button mr-1 my-2"
    on:click={openHelpModal}
    data-test-id="help-button"
>
    ?
</button>
<MyModal {modalTitle} {modalTexts} bind:modalOpen />
<div class="flex flex-col w-full max-w-md px-3 h-px flex-auto overflow-y-auto">
    <ul data-test-id="splits-list" class="my-auto">
        {#each splits as split}
            <a
                class="flex w-full bg-primary rounded-lg p-3 my-1.5 active:scale-95 hover:bg-opacity-50 transition-all border-2 {split.name ===
                user?.activeSplit
                    ? 'border-accent'
                    : 'border-base-100'}"
                in:scale
                href="/records/splits/{split.name}"
                on:click={() => clearStores(split.name)}
            >
                <h2
                    class={`text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap ${
                        modifiedSplit === split.name
                            ? 'text-yellow-400 underline underline-offset-4'
                            : ''
                    }`}
                >
                    {split.name}
                </h2>
                <h3 class="ml-auto basis-28 text-right shrink-0">
                    {getFormattedDate(split.timeCreated)}
                </h3>
            </a>
        {/each}
    </ul>
    {#if splits.length === 0}
        <div class="flex flex-grow flex-col justify-center items-center gap-3">
            <h2 class="text-center" data-test-id="no-split-label">No split created</h2>
            <a href="/splits/new" class="btn btn-primary w-full" data-test-id="create-split-button"
                >Create split</a
            >
        </div>
    {/if}
</div>
