<script lang="ts">
    import { goto } from '$app/navigation';
    import ExerciseTable from '$lib/ExerciseTable.svelte';
    import MyModal from '$lib/MyModal.svelte';
    import { truncate } from '$lib/usefulFunctions';
    import { onMount } from 'svelte';
    import { SplitName, SplitSchedule, SplitWorkouts } from '../../splitStore';

    let modalTitle: string;
    let modalTexts: string[];
    let modalOpen = false;

    let scheduleElements: Record<string, HTMLButtonElement> = {};
    let selectedUniqueWorkout: string;
    let splitWorkouts = $SplitWorkouts;

    let cancelAction: () => void;

    // Redirect if stores are empty
    const emptySchedule = { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' };
    onMount(() => {
        if ($SplitName === '' || $SplitSchedule === emptySchedule) {
            goto('/splits/new');
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

    function saveSplit() {
        let errors: string[] = [];
        for (const [name, exercises] of Object.entries(splitWorkouts)) {
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
        goto('/splits/new/options');
    }
</script>

<svelte:head>
    <title>MyFit | New split</title>
</svelte:head>
<div class="breadcrumbs-container">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/splits">Splits</a></li>
        <li>New ({truncate($SplitName, 8)})</li>
        <li>Workouts</li>
    </ul>
</div>
<MyModal {modalTexts} {modalTitle} bind:modalOpen />
<div
    class="grid grid-cols-4 lg:grid-cols-7 gap-1 w-full max-w-xl place-items-center"
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
                class="text-center bg-secondary text-black rounded-b-lg py-0.5 w-full"
                data-test-id={'workout-' + day}
            >
                {truncate($SplitSchedule[day], 7)}
            </p>
        </button>
    {/each}
    <button
        class="rounded-full border-2 border-accent w-fit px-3 font-semibold hover:bg-black cursor-pointer transition-colors lg:col-span-full lg:mt-2"
        on:click={openHelpModal}
        data-test-id="help-button"
    >
        ?
    </button>
</div>
<div class="flex justify-center w-full flex-1">
    <ExerciseTable
        workoutName={selectedUniqueWorkout}
        bind:exercises={splitWorkouts[selectedUniqueWorkout]}
        bind:cancelAction
    />
</div>
<button class="basis-10 footer-button" on:click={saveSplit}> Set split options </button>
