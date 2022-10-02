<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import MyModal from '$lib/MyModal.svelte';
    import { areArraysIdentical, getFormattedDate, colors } from '$lib/usefulFunctions';
    import { fly, scale } from 'svelte/transition';
    import {
        EditingWorkout,
        EditingWorkoutName,
        CurrentSplit,
        EditedWorkouts,
        SplitSchedule,
        CreatedWorkouts
    } from './editSplitStore';
    const user = $page.data.user;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const split = $page.data.user?.splits[$page.params.split] as Split;
    if (!split) {
        goto('/records/splits');
    }
    $CurrentSplit = JSON.parse(JSON.stringify(split));

    let splitName = split.name;
    let splitSchedule: string[] = JSON.parse(JSON.stringify(split.schedule));
    let progressionValue = split.progressiveOverload;
    let thisActive = user?.activeSplit === split.name;
    let changeStatus = 'Back';

    if ($SplitSchedule) {
        splitSchedule = $SplitSchedule;
    }

    const uniqueWorkoutsIndices: number[] = [];
    const uniqueWorkouts = new Set<string>();
    for (let i = 0; i < 7; i++) {
        const workout = split.schedule[i];
        if (!uniqueWorkouts.has(workout) && workout !== 'Rest') {
            uniqueWorkouts.add(split.schedule[i]);
            uniqueWorkoutsIndices.push(i);
        }
    }

    // Progression stuff
    let frequency: '/week' | '/month' | '/session' = split.overloadFrequency;
    const freqMultiplier: Record<string, number> = { '/month': 0.5, '/week': 1, '/session': 1.5 };
    let meanOverload: number;
    $: meanOverload = freqMultiplier[frequency] * progressionValue;
    let textColor = 'text-white';

    $: if (meanOverload !== undefined) {
        let closestColors = colors.get(25);
        if (closestColors) {
            for (let [overload, maybeColors] of colors) {
                if (overload >= meanOverload) {
                    closestColors = maybeColors;
                    break;
                }
            }
            textColor = closestColors[0];
        }
    }

    let modalTitle: string;
    let modalTexts: string[];
    let modalOpen = false;

    $: updateChanges(splitName, frequency, progressionValue, thisActive, splitSchedule);

    function updateChanges(..._args: any[]) {
        let changes = [];
        if (splitName !== split.name) {
            changes.push(`Name\n${split.name} -> ${splitName}\n\t`);
        }
        if (!areArraysIdentical(splitSchedule, split.schedule)) {
            let changeString = 'Schedule\n';
            for (let i = 0; i < 7; i++) {
                if (split.schedule[i] !== splitSchedule[i]) {
                    changeString += `${days[i]}: ${split.schedule[i]} -> ${splitSchedule[i]}\n`;
                }
            }
            changes.push(changeString + '\t');
            $SplitSchedule = splitSchedule;
        }
        if (frequency !== split.overloadFrequency) {
            changes.push(`Overload frequency\n${split.overloadFrequency} -> ${frequency}\n\t`);
        }
        if (progressionValue !== split.progressiveOverload) {
            changes.push(
                `Overload value\n${split.progressiveOverload}% -> ${progressionValue}%\n\t`
            );
        }
        if (thisActive !== (user?.activeSplit === split.name)) {
            if (thisActive) {
                changes.push(`Active split\n${user?.activeSplit} -> ${splitName}\n\t`);
            } else {
                changes.push(`Active split\n${user?.activeSplit} -> None\n\t`);
            }
        }
        if (changes.length > 0) {
            changeStatus = 'Review changes';
        } else {
            changeStatus = 'Save';
        }
        return changes;
    }

    function reviewChanges() {
        let changes = updateChanges();
        if (changes.length > 0) {
            // Remove newline on last change (looks better)
            changes[changes.length - 1] = changes[changes.length - 1].replace('\n\t', '');
            modalTitle = 'Review changes';
            modalTexts = changes;
            modalOpen = true;
        } else {
            goto('/records/splits');
        }
    }

    function workoutChanged(i: number) {
        const workout = splitSchedule[i];
        const originalWorkout = split.splitWorkouts[workout];
        const editedWorkout = $EditedWorkouts[workout];
        if (!editedWorkout) {
            return false;
        }
        if (originalWorkout.length !== editedWorkout.length) {
            return true;
        }
        for (let i = 0; i < originalWorkout.length; i++) {
            if (JSON.stringify(originalWorkout[i]) !== JSON.stringify(editedWorkout[i])) {
                return true;
            }
        }
        return false;
    }

    function editWorkout(name: string) {
        $EditingWorkoutName = name;
        $EditingWorkout = JSON.parse(JSON.stringify(split.splitWorkouts[name]));
        goto(`/records/splits/${split.name}/${name}`);
    }

    async function createWorkout(name: string) {
        $CreatedWorkouts[name] = [];
        await goto(`/records/splits/${split.name}/${name}?new=true`);
    }
</script>

<svelte:head>
    <title>MyFit | Split records</title>
</svelte:head>
<MyModal bind:modalOpen {modalTitle} {modalTexts} />
<div class="flex flex-col flex-grow justify-center w-full items-center max-w-5xl">
    <div class="flex items-center w-full max-w-md mb-2 md:mb-8 lg:mb-12">
        <h2 class="text-lg py-1 bg-primary text-center rounded-l-md w-fit px-8 font-semibold">
            Name
        </h2>
        <input
            class="text-lg font-semibold py-1 bg-secondary text-black w-full text-center rounded-r-md"
            bind:value={splitName}
        />
    </div>
    <div class="grid md:grid-cols-2 w-full gap-2 md:gap-10 mb-2">
        <div class="flex flex-col justify-center bg-primary rounded-lg p-4 pb-7">
            <h3 class="font-semibold text-xl ml-2 mb-1">Schedule</h3>
            <div class="flex flex-col gap-2 flex-grow justify-center text-base">
                {#each days as day, i}
                    <div class="flex text-black bg-secondary rounded-lg">
                        <h4
                            class="basis-14 flex-shrink-0 font-semibold pl-2.5 bg-accent rounded-l-lg py-1"
                        >
                            {day}
                        </h4>
                        <input
                            class="w-full text-center py-1"
                            on:focusout={function focusout({ currentTarget }) {
                                if (currentTarget.value.trim() === '') {
                                    splitSchedule[i] = 'Rest';
                                }
                            }}
                            bind:value={splitSchedule[i]}
                        />
                        {#key splitSchedule[i]}
                            <div class="basis-24 flex-shrink-0 text-center">
                                {#if workoutChanged(i)}
                                    {#if splitSchedule.indexOf(splitSchedule[i]) === i}
                                        <p class="px-2 bg-warning py-1">Changed</p>
                                    {:else}
                                        <p class="px-2 bg-warning py-1">
                                            ({days[splitSchedule.indexOf(splitSchedule[i])]})
                                        </p>
                                    {/if}
                                {:else if !uniqueWorkouts.has(splitSchedule[i]) && splitSchedule[i] !== 'Rest' && splitSchedule[i].trim() !== ''}
                                    {#if splitSchedule.indexOf(splitSchedule[i]) === i}
                                        <p class="px-2 bg-success py-1">New</p>
                                    {:else}
                                        <p class="px-2 bg-success py-1">
                                            ({days[splitSchedule.indexOf(splitSchedule[i])]})
                                        </p>
                                    {/if}
                                {/if}
                            </div>
                        {/key}
                        <div
                            class="basis-16 flex-shrink-0 bg-base-100 text-center text-white rounded-r-lg py-1"
                        >
                            {#if (uniqueWorkouts.has(splitSchedule[i]) || splitSchedule[i] === 'Rest') && uniqueWorkoutsIndices.includes(i)}
                                <button
                                    on:click={() => editWorkout(splitSchedule[i])}
                                    in:scale|local={{ duration: 200 }}
                                    class="w-full"
                                >
                                    Edit
                                </button>
                            {:else if uniqueWorkouts.has(splitSchedule[i]) || splitSchedule[i] === 'Rest' || splitSchedule[i].trim() === ''}
                                <div />
                            {:else if splitSchedule.indexOf(splitSchedule[i]) === i}
                                <button
                                    on:click={() => createWorkout(splitSchedule[i])}
                                    in:scale|local={{ duration: 200 }}
                                    class="w-full"
                                >
                                    +
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        <div class="flex flex-col gap-2 md:gap-4">
            <div class="bg-primary rounded-xl">
                <div class="stat">
                    <div class="stat-figure">
                        <select class="select select-sm w-28" bind:value={frequency}>
                            <option>/session</option>
                            <option selected>/week</option>
                            <option>/month</option>
                        </select>
                    </div>
                    <div class="stat-title font-semibold text-lg opacity-95">Progression</div>
                    {#key progressionValue}
                        <div
                            class="stat-value text-4xl transition-colors {textColor} mb-1"
                            in:fly={{ duration: 150, y: 25 }}
                        >
                            {progressionValue}%
                        </div>
                    {/key}
                </div>
                <div class="mx-5 -mt-3 mb-3">
                    <input
                        type="range"
                        class="range range-xs range-secondary"
                        max="25"
                        step="2.5"
                        bind:value={progressionValue}
                    />
                </div>
            </div>
            <div class="stat bg-primary rounded-xl">
                <div class="stat-figure text-secondary">
                    <input type="checkbox" class="toggle" bind:checked={thisActive} />
                </div>
                <div class="stat-title opacity-95 font-semibold">Status</div>
                {#if thisActive}
                    <div class="stat-value text-success">Active</div>
                {:else}
                    <div class="stat-value">Inactive</div>
                {/if}
            </div>
            <div class="stat bg-primary rounded-xl">
                <div class="stat-title opacity-95 font-semibold">Created on</div>
                <div class="stat-value text-accent">
                    {getFormattedDate(split.timeCreated)}
                </div>
            </div>
        </div>
    </div>
</div>
{#key changeStatus}
    <button class="footer-button" on:click={reviewChanges}>
        {changeStatus}
    </button>
{/key}
