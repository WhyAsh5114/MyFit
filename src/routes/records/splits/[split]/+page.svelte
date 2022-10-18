<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';
    import MyModal from '$lib/MyModal.svelte';
    import { areArraysIdentical, getFormattedDate, colors } from '$lib/usefulFunctions';
    import { fly } from 'svelte/transition';
    import {
        CurrentSplit,
        SplitSchedule,
        SplitName,
        SplitWorkouts,
        CurrentSplitActive,
        CurrentSplitOriginalName
    } from './editSplitStore';
    const user = $page.data.user;

    let modalTitle: string;
    let modalTexts: string[];
    let modalOpen = false;
    let onClose: () => void = () => {};

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const split = $page.data.user?.splits[$page.params.split] as Split;

    let modifyWorkoutsButton: HTMLButtonElement;
    let changeStatus = 'Back';

    let splitSchedule: Record<string, string> = {};
    days.forEach((day, i) => {
        splitSchedule[day] = split.schedule[i];
    });

    // Load stores, if not loaded
    if (!$CurrentSplit || !$CurrentSplitOriginalName) {
        $CurrentSplit = JSON.parse(JSON.stringify(split));
        $SplitName = split.name;
        $SplitWorkouts = JSON.parse(JSON.stringify(split.splitWorkouts));
        $SplitSchedule = splitSchedule;
        $CurrentSplitActive = user?.activeSplit === split.name;
        $CurrentSplitOriginalName = split.name;
    }

    // Override schedule if already exists in store
    if ($SplitSchedule) {
        splitSchedule = $SplitSchedule;
    }

    let progressionValue = $CurrentSplit.progressiveOverload;
    if ($CurrentSplitActive === undefined) {
        $CurrentSplitActive = user?.activeSplit === split.name;
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
    let frequency: '/week' | '/month' | '/session' = $CurrentSplit.overloadFrequency;
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

    function workoutChanged(i: number) {
        const workout = splitSchedule[days[i]];
        const originalWorkout = split.splitWorkouts[workout];
        const editedWorkout = $SplitWorkouts[workout];

        if (!editedWorkout || !Object.values(split.schedule).includes(workout)) {
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

    function modifyWorkouts() {
        let uniqueWorkouts = new Set(Object.values(splitSchedule));
        if (uniqueWorkouts.has('Rest') && uniqueWorkouts.size === 1) {
            modalTitle = 'Error';
            modalTexts = ['Should have at least one unique workout'];
            onClose = () => {};
            modalOpen = true;
            return;
        }

        // Add newly created workouts to $SplitSchedule with empty Exercise[]
        Object.values($SplitSchedule).forEach((element) => {
            if (!Object.keys($SplitWorkouts).includes(element) && element !== 'Rest') {
                $SplitWorkouts[element] = [];
            }
        });
        goto(`/records/splits/${split.name}/workouts`);
    }

    let deletingModalOpen = false;
    let deletingModalTitle = '';
    let deletingModalTexts: string[] = [];
    function confirmDeleteSplit() {
        deletingModalTitle = 'Warning';
        deletingModalTexts = [
            'Are you sure you want to delete this split?',
            'This action cannot be undone!'
        ];
        deletingModalOpen = true;
    }

    async function deleteSplit() {
        const res = await fetch('/api/splits/deleteSplit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                splitName: split.name,
                user: $page.data.user
            })
        });
        const body = await res.text();
        if (res.ok) {
            modalTitle = 'Success';
            modalTexts = [body];
            onClose = async () => {
                await invalidateAll();
                await goto('/records/splits');
            };
            modalOpen = true;
        }
    }

    function resetChanges() {
        // TODO: Reset modified workouts as well...
        // or have a different button to reset workouts
        $SplitName = split.name;
        $CurrentSplit = JSON.parse(JSON.stringify(split));
        days.forEach((day, i) => {
            splitSchedule[day] = split.schedule[i];
        });
        $SplitSchedule = splitSchedule;
        $SplitWorkouts = JSON.parse(JSON.stringify(split.splitWorkouts));
        $CurrentSplitActive = user?.activeSplit === split.name;
        frequency = split.overloadFrequency;
        progressionValue = split.progressiveOverload;
    }

    $: updateChanges($SplitName, frequency, progressionValue, $CurrentSplitActive, splitSchedule);
    function updateChanges(..._args: any[]) {
        let changes = [];
        if ($SplitName !== split.name) {
            changes.push(`Name\n${split.name} -> ${$SplitName}\n\t`);
            $CurrentSplit.name = $SplitName;
        }
        if (!areArraysIdentical(Object.values(splitSchedule), split.schedule)) {
            let changeString = 'Schedule\n';
            for (let i = 0; i < 7; i++) {
                if (split.schedule[i] !== splitSchedule[days[i]]) {
                    changeString += `${days[i]}: ${split.schedule[i]} -> ${
                        splitSchedule[days[i]]
                    }\n`;
                }
            }
            changes.push(changeString + '\t');
            $SplitSchedule = splitSchedule;
        }
        // Check for each individual workout as well
        // if workout was modified, have it displayed in Review changes modal
        if (frequency !== split.overloadFrequency) {
            changes.push(`Overload frequency\n${split.overloadFrequency} -> ${frequency}\n\t`);
            $CurrentSplit.overloadFrequency = frequency;
        }
        if (progressionValue !== split.progressiveOverload) {
            changes.push(
                `Overload value\n${split.progressiveOverload}% -> ${progressionValue}%\n\t`
            );
            $CurrentSplit.progressiveOverload = progressionValue;
        }
        if ($CurrentSplitActive !== (user?.activeSplit === split.name)) {
            if ($CurrentSplitActive) {
                let currentlyActiveSplit = user?.activeSplit || 'None';
                changes.push(`Active split\n${currentlyActiveSplit} -> ${$SplitName}\n\t`);
            } else {
                changes.push(`Active split\n${user?.activeSplit} -> None\n\t`);
            }
        }
        if (changes.length > 0) {
            changeStatus = 'Review changes';
        } else {
            changeStatus = 'Back';
        }
        return changes;
    }

    let modifyingModalOpen = false;
    let modifyingModalTitle = '';
    let modifyingModalTexts: string[] = [];
    function reviewChanges() {
        let changes = updateChanges();
        if (changes.length > 0) {
            // Remove newline on last change (looks better)
            changes[changes.length - 1] = changes[changes.length - 1].replace('\n\t', '');
            modifyingModalTitle = 'Review changes';
            modifyingModalTexts = changes;
            modifyingModalOpen = true;
        } else {
            goto('/records/splits');
        }
    }

    // TODO: shouldn't change splitName to a split which already exists (conflict 409)

    async function saveChanges() {
        let emptyWorkouts: string[] = [];
        $SplitSchedule = splitSchedule;

        let uniqueWorkouts = new Set(Object.values(splitSchedule));
        if (uniqueWorkouts.has('Rest') && uniqueWorkouts.size === 1) {
            modalTitle = 'Error';
            modalTexts = ['Should have at least one unique workout'];
            onClose = () => {};
            modalOpen = true;
            return;
        }

        // Add workouts not originally present in the split
        Object.values($SplitSchedule).forEach((element) => {
            if (!Object.keys($SplitWorkouts).includes(element) && element !== 'Rest') {
                $SplitWorkouts[element] = [];
            }
        });
        Object.keys($SplitWorkouts).forEach((workoutName) => {
            if (!Object.values($SplitSchedule).includes(workoutName)) {
                delete $SplitWorkouts[workoutName];
                return;
            }
            if ($SplitWorkouts[workoutName].length === 0) {
                emptyWorkouts.push(workoutName);
            }
        });

        if (emptyWorkouts.length > 0) {
            modalTitle = 'Error';
            modalTexts = [];
            emptyWorkouts.forEach((workoutName) => {
                modalTexts.push(`Add at least one exercise in ${workoutName}`);
            });
            modalOpen = true;
            modifyWorkoutsButton.classList.add('animate-pulse');
            return;
        }

        $CurrentSplit.name = $SplitName;
        $CurrentSplit.splitWorkouts = $SplitWorkouts;
        $CurrentSplit.overloadFrequency = frequency;
        $CurrentSplit.schedule = Object.values($SplitSchedule);
        $CurrentSplit.progressiveOverload = progressionValue;

        const res = await fetch('/api/splits/modifySplit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                thisActive: $CurrentSplitActive,
                oldSplitName: split.name,
                user: $page.data.user,
                split: $CurrentSplit
            })
        });
        const body = await res.text();
        if (res.ok) {
            modalTitle = 'Success';
            modalTexts = [body];
            onClose = async () => {
                await invalidateAll();
                await goto('/records/splits');
            };
            modalOpen = true;
        } else {
            modalTitle = 'Error';
            modalTexts = [body];
            onClose = () => {};
        }
    }
</script>

<svelte:head>
    <title>MyFit | Split records</title>
</svelte:head>
<MyModal bind:modalOpen {modalTitle} {modalTexts} bind:onClose />
<MyModal
    bind:modalOpen={deletingModalOpen}
    modalTitle={deletingModalTitle}
    modalTexts={deletingModalTexts}
    modalName="deletingModal"
>
    <div class="flex justify-around">
        <button
            class="btn btn-error text-white basis-36"
            data-test-id="delete-split-modal-button"
            on:click={() => {
                deletingModalOpen = false;
                deleteSplit();
            }}>Delete split</button
        >
        <button
            class="btn btn-accent basis-36"
            data-test-id="cancel-delete-modal-button"
            on:click={() => {
                deletingModalOpen = false;
            }}>Cancel</button
        >
    </div>
</MyModal>
<MyModal
    bind:modalOpen={modifyingModalOpen}
    modalTitle={modifyingModalTitle}
    modalTexts={modifyingModalTexts}
    modalName="modifyingModal"
>
    <div class="flex justify-around">
        <button
            class="btn btn-accent basis-36"
            data-test-id="save-split-modal-button"
            on:click={() => {
                modifyingModalOpen = false;
                saveChanges();
            }}>Save split</button
        >
        <button
            class="btn btn-error basis-36 text-white"
            data-test-id="cancel-save-modal-button"
            on:click={() => {
                modifyingModalOpen = false;
            }}>Cancel</button
        >
    </div>
</MyModal>
<div class="flex flex-col flex-grow justify-center w-full items-center max-w-5xl">
    <div class="flex justify-evenly w-full max-w-sm gap-5">
        <button
            class="btn btn-sm btn-primary mb-3 basis-36"
            on:click={resetChanges}
            data-test-id="reset-changes-button"
        >
            Reset changes
        </button>
        <button
            class="btn btn-sm btn-error mb-3 basis-36 text-white"
            data-test-id="delete-split-button"
            on:click={confirmDeleteSplit}
        >
            Delete split
        </button>
    </div>
    <div class="flex items-center w-full max-w-md mb-2 md:mb-8 lg:mb-12">
        <label
            class="text-lg py-1 bg-primary text-center rounded-l-md w-fit px-8 font-semibold"
            for="split-name-input"
        >
            Name
        </label>
        <input
            class="text-lg font-semibold py-1 bg-secondary text-black w-full text-center rounded-r-md"
            bind:value={$SplitName}
            id="split-name-input"
            data-test-id="split-name-input"
        />
    </div>
    <div class="grid md:grid-cols-2 w-full gap-2 md:gap-10 mb-2">
        <div class="flex flex-col justify-center bg-primary rounded-lg p-4">
            <h3 class="font-semibold text-xl ml-2 mb-2">Schedule</h3>
            <div class="flex flex-col gap-2 flex-grow justify-center text-base">
                {#each days as day, i}
                    <div
                        class="flex text-black bg-secondary rounded-lg"
                        data-test-id="schedule-inputs-container"
                    >
                        <label
                            class="basis-14 flex-shrink-0 font-semibold pl-2.5 bg-accent rounded-l-lg py-1"
                            for={`${day}-workout-input`}
                        >
                            {day}
                        </label>
                        <input
                            class="w-full text-center py-1"
                            on:focusout={function focusout({ currentTarget }) {
                                if (currentTarget.value.trim() === '') {
                                    splitSchedule[day] = 'Rest';
                                }
                            }}
                            bind:value={splitSchedule[day]}
                            id={`${day}-workout-input`}
                            data-test-id={`${day}-workout-input`}
                        />
                        {#key splitSchedule[day]}
                            <div class="basis-24 flex-shrink-0 text-center">
                                {#if workoutChanged(i)}
                                    {#if Object.values(splitSchedule).indexOf(splitSchedule[day]) === i}
                                        <p class="px-2 bg-warning py-1 rounded-r-lg">Changed</p>
                                    {:else}
                                        <p class="px-2 bg-warning py-1 rounded-r-lg">
                                            ({days[
                                                Object.values(splitSchedule).indexOf(
                                                    splitSchedule[day]
                                                )
                                            ]})
                                        </p>
                                    {/if}
                                {:else if !uniqueWorkouts.has(splitSchedule[day]) && splitSchedule[day] !== 'Rest' && splitSchedule[day].trim() !== ''}
                                    {#if Object.values(splitSchedule).indexOf(splitSchedule[day]) === i}
                                        <p class="px-2 bg-success py-1 rounded-r-lg">New</p>
                                    {:else}
                                        <p class="px-2 bg-success py-1 rounded-r-lg">
                                            ({days[
                                                Object.values(splitSchedule).indexOf(
                                                    splitSchedule[day]
                                                )
                                            ]})
                                        </p>
                                    {/if}
                                {:else if Object.values(splitSchedule).indexOf(splitSchedule[day]) !== i && splitSchedule[day] !== 'Rest'}
                                    <p class="px-2 py-1">
                                        ({days[
                                            Object.values(splitSchedule).indexOf(splitSchedule[day])
                                        ]})
                                    </p>
                                {/if}
                            </div>
                        {/key}
                    </div>
                {/each}
            </div>
            <button
                class="btn btn-sm mt-5 normal-case text-base bg-black"
                data-test-id="modify-workouts-button"
                on:click={modifyWorkouts}
                on:mouseenter={function removeAnimation({ currentTarget }) {
                    currentTarget.classList.remove('animate-pulse');
                }}
                bind:this={modifyWorkoutsButton}>Modify workouts</button
            >
        </div>
        <div class="flex flex-col gap-2 md:gap-4 grow justify-between">
            <div class="bg-primary rounded-xl">
                <div class="stat">
                    <div class="stat-figure">
                        <select
                            class="select select-sm w-28"
                            bind:value={frequency}
                            data-test-id="overload-frequency-selector"
                        >
                            <option>/session</option>
                            <option>/week</option>
                            <option>/month</option>
                        </select>
                    </div>
                    <label
                        class="stat-title font-semibold text-lg opacity-95"
                        for="progression-range-input">Progression</label
                    >
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
                        id="progression-range-input"
                        data-test-id="progression-range-input"
                        bind:value={progressionValue}
                    />
                </div>
            </div>
            <div class="stat bg-primary rounded-xl">
                <div class="stat-figure text-secondary">
                    <input
                        type="checkbox"
                        class="toggle"
                        bind:checked={$CurrentSplitActive}
                        id="split-status-input"
                        data-test-id="split-status-input"
                        aria-label="split-status-input"
                    />
                </div>
                <label class="stat-title opacity-95 font-semibold" for="split-status-input"
                    >Status</label
                >
                {#if $CurrentSplitActive}
                    <div class="stat-value text-success">Active</div>
                {:else}
                    <div class="stat-value">Inactive</div>
                {/if}
            </div>
            <div class="stat bg-primary rounded-xl">
                <div class="stat-title opacity-95 font-semibold">Created on</div>
                <div class="stat-value text-accent" data-test-id="date-created-div">
                    {getFormattedDate(split.timeCreated)}
                </div>
            </div>
        </div>
    </div>
</div>
{#key changeStatus}
    <button class="footer-button" on:click={reviewChanges} data-test-id="save-button">
        {changeStatus}
    </button>
{/key}
