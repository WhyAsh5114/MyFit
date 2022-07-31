<script context="module" lang="ts">
    export { loadUserOrRedirectToLogin as load } from '$lib/loadUserOrRedirectToLogin';
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import Breadcrumbs from '$lib/Breadcrumbs.svelte';
    import MyModal from '$lib/MyModal.svelte';
    import { onMount } from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import { SplitSchedule, SplitName, SplitWorkouts } from '../splitStore';

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

    const messages: Record<number, string> = {
        0: 'Why so low?',
        2.5: 'Not bad',
        5: 'Nice sweet spot',
        7.5: 'Good for beginners!',
        10: 'A bit tough huh?',
        12.5: 'Sure about this?',
        15: 'Entering danger zone!',
        17.5: "Don't overdo it!",
        20: "Don't overdo it!",
        22.5: "Don't overdo it!",
        25: 'What!?'
    };
    const colors = new Map<number, Array<string>>([
        [0, ['text-white', 'border-white', 'stroke-white', 'fill-white']],
        [2.5, ['text-green-300', 'border-green-300', 'stroke-green-300', 'fill-green-300']],
        [5, ['text-green-400', 'border-green-400', 'stroke-green-400', 'fill-green-400']],
        [7.5, ['text-lime-500', 'border-lime-500', 'stroke-lime-500', 'fill-lime-500']],
        [10, ['text-yellow-400', 'border-yellow-400', 'stroke-yellow-400', 'fill-yellow-400']],
        [12.5, ['text-amber-500', 'border-amber-500', 'stroke-amber-500', 'fill-amber-500']],
        [15, ['text-orange-500', 'border-orange-500', 'stroke-orange-500', 'fill-orange-500']],
        [17.5, ['text-red-500', 'border-red-500', 'stroke-red-500', 'fill-red-500']],
        [20, ['text-red-500', 'border-red-500', 'stroke-red-500', 'fill-red-500']],
        [22.5, ['text-red-500', 'border-red-500', 'stroke-red-500', 'fill-red-500']],
        [25, ['text-red-600', 'border-red-600', 'stroke-red-600', 'fill-red-600']]
    ]);

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
            body: JSON.stringify(newSplit)
        });
        if (res.ok) {
            modalTitle = 'Success';
            modalTexts = ['Split created successfully'];
            onClose = () => goto('/');
            modalOpen = true;
        } else {
            const body = await res.json();
            modalTitle = 'Error';
            modalTexts = [body.message];
            onClose = () => {};
            modalOpen = true;
        }
    }
</script>

<svelte:head>
    <title>MyFit | New split</title>
</svelte:head>
<Breadcrumbs>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/splits">Splits</a></li>
        <li>New ({$SplitName})</li>
        <li>Options</li>
    </ul>
</Breadcrumbs>
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
<button
    class="btn normal-case lg:btn-lg btn-primary w-full text-base lg:text-lg mt-auto"
    on:click={createSplit}
>
    Create split
</button>
