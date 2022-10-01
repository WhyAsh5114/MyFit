<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';
    import MyModal from '$lib/MyModal.svelte';
    import { onMount } from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import { SplitSchedule, SplitName, SplitWorkouts } from '../../splitStore';
    import { colors, messages } from '$lib/usefulFunctions';

    let progressionValue = 5;
    let frequency: '/week' | '/month' | '/session' = '/week';

    const freqMultiplier: Record<string, number> = { '/month': 0.5, '/week': 1, '/session': 1.5 };
    let meanOverload: number;
    $: meanOverload = freqMultiplier[frequency] * progressionValue;

    let modalTitle: string;
    let modalTexts: string[];
    let modalOpen = false;
    let onClose = () => {};

    // Redirect if stores are empty
    const emptySchedule = { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' };
    onMount(() => {
        if ($SplitName === '' || $SplitSchedule === emptySchedule) {
            goto('/splits/new');
            return;
        }
    });

    let textColor = 'text-white',
        borderColor = 'border-white',
        strokeColor = 'stroke-white',
        fillColor = 'fill-white',
        message = 'Nice sweet spot';

    $: if (meanOverload !== undefined) {
        let closestColors = colors.get(25);
        message = messages[25];
        if (closestColors) {
            for (let [overload, maybeColors] of colors) {
                if (overload >= meanOverload) {
                    closestColors = maybeColors;
                    message = messages[overload];
                    break;
                }
            }
            [textColor, borderColor, strokeColor, fillColor] = closestColors;
        }
    }

    async function createSplit() {
        const newSplit: Split = {
            name: $SplitName,
            schedule: Object.values($SplitSchedule),
            splitWorkouts: $SplitWorkouts,
            progressiveOverload: progressionValue,
            overloadFrequency: frequency,
            timeCreated: +new Date()
        };

        const res = await fetch('/api/saveSplit', {
            method: 'POST',
            body: JSON.stringify({ split: newSplit, user: $page.data.user })
        });
        if (res.ok) {
            modalTitle = 'Success';
            modalTexts = ['Split created successfully'];
            onClose = () => goto('/');
            modalOpen = true;
            await invalidateAll();
        } else {
            const body = await res.text();
            modalTitle = 'Error';
            modalTexts = [body];
            onClose = () => {};
            modalOpen = true;
        }
    }
</script>

<svelte:head>
    <title>MyFit | New split</title>
</svelte:head>
<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/splits">Splits</a></li>
        <li>New ({$SplitName})</li>
        <li>Options</li>
    </ul>
</div>
<MyModal bind:modalOpen {modalTitle} {modalTexts} bind:onClose />
<div class="flex h-full justify-center w-full">
    <div
        class="flex flex-col max-w-lg mx-2 p-2 lg:p-10 border-4 rounded-xl self-center w-full bg-primary bg-opacity-50 {borderColor} transition-colors"
    >
        <div class="stat">
            <div class="stat-figure">
                <svg
                    width="75"
                    viewBox="0 0 425 358"
                    fill="none"
                    class="{strokeColor} {fillColor} transition-colors"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <line x1="10" x2="10" y2="358" stroke-width="15" />
                    <path
                        d="M388.699 9.62692C386.836 5.92734 382.326 4.43843 378.627 6.30134L318.339 36.6592C314.639 38.5221 313.15 43.0314 315.013 46.7309C316.876 50.4305 321.385 51.9194 325.085 50.0565L378.674 23.0718L405.659 76.6612C407.522 80.3608 412.031 81.8497 415.731 79.9868C419.43 78.1239 420.919 73.6146 419.057 69.915L388.699 9.62692ZM319.122 227.352L389.122 15.3516L374.878 10.6485L304.878 222.648L319.122 227.352Z"
                    />
                    <line y1="348" x2="425" y2="348" stroke-width="15" />
                    <path
                        fill="none"
                        d="M58 306L108.5 232L166 278.5L214.5 196L265 159L314 232"
                        stroke-width="18"
                    />
                </svg>
            </div>
            <div class="stat-title font-semibold text-lg opacity-75">Progression</div>
            {#key progressionValue}
                <div
                    class="stat-value text-4xl transition-colors {textColor} mb-1"
                    in:fly={{ duration: 150, y: 25 }}
                >
                    {progressionValue}%
                </div>
            {/key}
            {#key message}
                <div class="stat-desc text-white text-sm opacity-70" in:fade={{ duration: 150 }}>
                    {message}
                </div>
            {/key}
        </div>
        <div class="mx-5 flex flex-col items-center gap-3 mb-3">
            <input
                type="range"
                class="range range-sm range-secondary"
                max="25"
                step="2.5"
                bind:value={progressionValue}
            />
            <select class="select select-sm w-44" bind:value={frequency}>
                <option>/session</option>
                <option selected>/week</option>
                <option>/month</option>
            </select>
        </div>
    </div>
</div>
<button class="footer-button mt-auto" on:click={createSplit}> Create split </button>
