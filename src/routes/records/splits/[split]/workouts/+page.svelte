<script lang="ts">
    import { goto } from '$app/navigation';
    import ExerciseTable from '$lib/ExerciseTable.svelte';
    import MyModal from '$lib/MyModal.svelte';
    import { truncate } from '$lib/usefulFunctions';
    import { onMount } from 'svelte';
    import {
        SplitSchedule,
        SplitWorkouts,
        SplitName,
        CurrentSplitOriginalName
    } from '../editSplitStore';

    let modalTitle: string;
    let modalTexts: string[];
    let modalOpen = false;
    let cancelAction: () => void;

    let scheduleElements: Record<string, HTMLButtonElement> = {};
    let selectedUniqueWorkout: string;

    onMount(() => {
        if ($SplitName === '' || $SplitSchedule === emptySchedule) {
            goto('/records/splits');
            return;
        }

        // Highlight the first unique workout days
        const firstUniqueWorkoutSchedule: string[] = uniqueWorkouts.values().next().value;
        for (const day of firstUniqueWorkoutSchedule) {
            scheduleElements[day]?.classList.add('border-accent');
            scheduleElements[day]?.classList.remove('border-base-100');
        }

        // Darken Rest days
        for (const day in $SplitSchedule) {
            const workout = $SplitSchedule[day];
            if (workout === 'Rest') {
                scheduleElements[day]?.classList.add('opacity-50');
                scheduleElements[day]?.classList.remove('cursor-pointer');
            }
        }
    });

    const emptySchedule = { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' };
    const uniqueWorkouts = new Map<string, string[]>();
    for (const day in $SplitSchedule) {
        const workout = $SplitSchedule[day];
        if (workout !== 'Rest' && !uniqueWorkouts.has(workout)) {
            uniqueWorkouts.set(workout, [day]);
        } else if (workout !== 'Rest') {
            uniqueWorkouts.get(workout)?.push(day);
        }
    }

    const firstUniqueWorkout: string = uniqueWorkouts.keys().next().value;
    selectedUniqueWorkout = firstUniqueWorkout;

    function changeSelectedUniqueWorkout(_day: string) {
        cancelAction();
        if ($SplitSchedule[_day] === 'Rest') return;
        const selectedWorkout = $SplitSchedule[_day];
        for (let [day, workout] of Object.entries($SplitSchedule)) {
            // This animation would be added if nothing was added
            // to this particular workout, so in case it has been added
            // remove it after selecting this particular workout
            scheduleElements[day]?.classList.remove('animate-pulse');
            if (workout === selectedWorkout) {
                scheduleElements[day]?.classList.add('border-accent');
                scheduleElements[day]?.classList.remove('border-base-100');
            } else {
                scheduleElements[day]?.classList.remove('border-accent');
                scheduleElements[day]?.classList.add('border-base-100');
            }
        }
        selectedUniqueWorkout = selectedWorkout;
    }

    function openHelpModal() {
        modalTitle = 'Help';
        modalTexts = [
            'Select unique workouts from the calendar section',
            'All days on which the workout is to be performed will be highlighted',
            'Create the workout using the action buttons at the bottom',
            'Add at least one exercise to each unique workout'
        ];
        modalOpen = true;
    }

    onMount(() => {
        for (const [name, exercises] of Object.entries($SplitWorkouts)) {
            if (exercises.length === 0) {
                for (let [day, workout] of Object.entries($SplitSchedule)) {
                    if (workout === name) {
                        scheduleElements[day].classList.add('animate-pulse');
                    }
                }
            }
        }
    });

    function modifyWorkouts() {
        let errors: string[] = [];
        for (const [name, exercises] of Object.entries($SplitWorkouts)) {
            if (exercises.length === 0) {
                errors.push(`Add at least one exercise in ${name}`);
                for (let [day, workout] of Object.entries($SplitSchedule)) {
                    if (workout === name) {
                        scheduleElements[day].classList.add('animate-pulse');
                    }
                }
            }
        }
        if (errors.length > 0) {
            modalTitle = 'Error';
            modalTexts = errors;
            modalOpen = true;
            return;
        }
        goto(`/records/splits/${$CurrentSplitOriginalName}`, { replaceState: false });
    }
</script>

<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/records">Records</a></li>
        <li><a href="/records/splits" data-test-id="records-splits-redirect">Splits</a></li>
        <li>
            <a
                href={`/records/splits/${$CurrentSplitOriginalName}`}
                data-test-id="records-splits-name-redirect"
            >
                {truncate($CurrentSplitOriginalName, 8)}
            </a>
        </li>
    </ul>
</div>
<MyModal {modalTexts} {modalTitle} bind:modalOpen />
<div
    class="grid mt-2 grid-cols-4 lg:grid-cols-7 gap-1 w-full max-w-xl place-items-center"
    data-test-id="calendar"
>
    {#each Object.keys($SplitSchedule) as day}
        <button
            class="flex flex-col w-full normal-case text-base font-normal rounded-xl cursor-pointer border-base-100 border-4"
            bind:this={scheduleElements[day]}
            on:click={() => changeSelectedUniqueWorkout(day)}
            data-test-id={'calendar-' + day}
        >
            <p
                class="bg-primary text-center w-full rounded-t-lg py-0.5 font-semibold"
                data-test-id={'day-' + day}
            >
                {day}
            </p>
            <p
                class="text-center bg-secondary text-black rounded-b-lg p-0.5 w-full text-ellipsis overflow-clip"
                data-test-id={'workout-' + day}
            >
                {$SplitSchedule[day]}
            </p>
        </button>
    {/each}
    <button
        class="modal-help-button lg:col-span-full lg:mt-2"
        on:click={openHelpModal}
        data-test-id="help-button"
    >
        ?
    </button>
</div>
<div class="flex justify-center w-full flex-1">
    <ExerciseTable
        workoutName={selectedUniqueWorkout}
        bind:exercises={$SplitWorkouts[selectedUniqueWorkout]}
        bind:cancelAction
    />
</div>
<button
    class="basis-10 footer-button"
    on:click={modifyWorkouts}
    data-test-id="modify-workouts-save-button"
>
    Modify workouts
</button>
