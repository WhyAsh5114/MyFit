<script lang="ts">
    import { goto } from '$app/navigation';
    import Breadcrumbs from '$lib/Breadcrumbs.svelte';
    import MyModal from '$lib/MyModal.svelte';
    import { onMount } from 'svelte';
    import { SplitName, SplitSchedule, SplitWorkouts } from '../splitStore';
    import { page } from '$app/stores';

    let splitName = '';
    let daysInput: Record<string, string> = {
        Mon: '',
        Tue: '',
        Wed: '',
        Thu: '',
        Fri: '',
        Sat: '',
        Sun: ''
    };
    let uniqueWorkouts = new Set<string>();

    onMount(() => {
        splitName = $SplitName;
        daysInput = $SplitSchedule;
        updateWorkouts();
    });

    let modalTitle: string;
    let modalTexts: string[];
    let modalOpen = false;

    function openHelpModal() {
        modalTitle = 'Help';
        modalTexts = [
            'Use different names if workouts are going to be different',
            'For example: if Push workout on Monday is different from Push workout on Thursday, use Push1 and Push2',
            'Use same names only for identical workouts'
        ];
        modalOpen = true;
    }

    function updateWorkouts() {
        let localUniqueWorkouts = new Set<string>();
        Object.values(daysInput).forEach((dayInput) => {
            if (dayInput !== '' && dayInput.toLowerCase() !== 'rest') {
                localUniqueWorkouts.add(dayInput);
            }
        });
        uniqueWorkouts = localUniqueWorkouts;
    }

    async function createSchedule() {
        let errors = [];
        if (splitName === '') {
            errors.push('Enter split name');
        }
        if (splitName in $page.data.user.splits) {
            errors.push('Split already exists');
        }
        if (uniqueWorkouts.size === 0) {
            errors.push('Add at least one workout');
        }
        if (errors.length > 0) {
            modalTitle = 'Error';
            modalTexts = errors;
            modalOpen = true;
            return;
        }

        SplitName.set(splitName);

        // Remove rest days and replace with ''
        for (let day in daysInput) {
            if (daysInput[day].toLowerCase() === 'rest' || daysInput[day] == '') {
                daysInput[day] = 'Rest';
            }
        }
        SplitSchedule.set(daysInput);

        // Set SplitWorkouts
        const splitWorkouts: Record<string, Array<Exercise>> = {};
        for (let workout of uniqueWorkouts) {
            splitWorkouts[workout] = new Array<Exercise>();
        }
        SplitWorkouts.set(splitWorkouts);

        await goto('/splits/new/workouts');
    }
</script>

<svelte:head>
    <title>MyFit | New split</title>
</svelte:head>

<Breadcrumbs>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/splits">Splits</a></li>
        <li>New</li>
    </ul>
</Breadcrumbs>
<MyModal {modalTexts} {modalTitle} bind:modalOpen />
<form on:submit|preventDefault class="flex flex-col flex-grow w-full justify-center items-center">
    <div class="flex flex-col gap-10 justify-center items-center max-w-xs flex-grow">
        <div
            class="rounded-full mr-1 border-2 border-accent w-fit px-3 font-semibold -my-7 hover:bg-black cursor-pointer place-self-end transition-colors"
            on:click={openHelpModal}
            data-test-id="help-button"
        >
            ?
        </div>
        <label class="input-group input-group-vertical shadow-black shadow-lg">
            <p class="text-center bg-primary py-1 font-semibold">Split name</p>
            <input
                type="text"
                name="split-name"
                class="input bg-secondary input-sm border-2 text-lg text-black col-span-2 text-center"
                bind:value={splitName}
                data-test-id="split-name-input"
                required
            />
        </label>
        <div class="flex flex-col gap-3.5 bg-primary p-4 rounded-lg shadow-black shadow-lg">
            {#each Object.keys(daysInput) as day}
                <label class="input-group input-group-sm shadow-md shadow-black">
                    <p class="bg-accent text-black w-20 font-semibold text-center">{day}</p>
                    <input
                        type="text"
                        name={day}
                        data-test-id={day}
                        class="input input-bordered w-full text-base bg-secondary text-black input-sm col-span-2 text-center"
                        bind:value={daysInput[day]}
                        on:input={updateWorkouts}
                        on:focus={updateWorkouts}
                    />
                </label>
            {/each}
        </div>
    </div>
    <button
        type="submit"
        class="btn normal-case lg:btn-lg btn-primary w-full text-base lg:text-lg"
        on:click={createSchedule}
        data-test-id="create-schedule-button"
    >
        {#if uniqueWorkouts.size === 1}
            Create {uniqueWorkouts.size} unique workout
        {:else}
            Create {uniqueWorkouts.size} unique workouts
        {/if}
    </button>
</form>
