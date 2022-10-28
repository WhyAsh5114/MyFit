<script lang="ts">
    import { goto } from '$app/navigation';
    import ExerciseTable from '$lib/ExerciseTable.svelte';
    import MyModal from '$lib/MyModal.svelte';
    import { getFormattedDate } from '$lib/usefulFunctions';
    import { WorkoutExercises, WorkoutName, WorkoutCreatedDate } from '../newWorkoutStore';

    let exercises: Exercise[] = [];

    const now = new Date();
    if ($WorkoutCreatedDate) {
        now.setTime(+$WorkoutCreatedDate);
    }
    let mins = now.getMinutes().toString();
    if (parseInt(mins) < 10) {
        mins = '0' + mins;
    }
    let hours = now.getHours().toString();
    if (parseInt(hours) < 10) {
        hours = '0' + hours;
    }
    let workoutName: string;
    if ($WorkoutName) {
        workoutName = $WorkoutName;
    } else {
        workoutName = getFormattedDate(+now) + ` -> ${hours}:${mins}`;
    }
    if ($WorkoutExercises) {
        exercises = JSON.parse(JSON.stringify($WorkoutExercises));
    }

    let modalOpen = false;
    let modalTitle = '';
    let modalTexts: string[] = [];

    function openTimePicker() {
        modalOpen = true;
        modalTitle = 'Change start time';
    }

    let hoursInput: HTMLInputElement;
    let minsInput: HTMLInputElement;
    function saveTime() {
        let h = parseInt(hoursInput.value);
        let m = parseInt(minsInput.value);
        if (h >= 0 && h <= 23 && !isNaN(h) && m >= 0 && m <= 59 && !isNaN(m)) {
            now.setHours(h);
            now.setMinutes(m);
            hours = h.toString();
            mins = m.toString();
        }
        if (parseInt(mins) < 10) {
            mins = '0' + mins;
        }
        if (parseInt(hours) < 10) {
            hours = '0' + hours;
        }
        workoutName = getFormattedDate(+now) + ` -> ${hours}:${mins}`;
        modalOpen = false;
    }

    let modalOpen3 = false;
    let month = (now.getMonth() + 1).toString();
    if (parseInt(month) < 10) {
        month = '0' + month;
    }
    let day = now.getDate().toString();
    if (parseInt(day) < 10) {
        day = '0' + day;
    }
    let startDateValue = `${now.getFullYear()}-${month}-${day}`;
    function saveDate() {
        const startDate = startDateValue.split('-');
        now.setFullYear(parseInt(startDate[0]));
        now.setMonth(parseInt(startDate[1]) - 1);
        now.setDate(parseInt(startDate[2]));
        workoutName = getFormattedDate(+now) + ` -> ${hours}:${mins}`;
        modalOpen3 = false;
    }

    let modalOpen2 = false;
    let modalTexts2: string[] = [];
    let modalTitle2 = '';
    function setWorkoutOptions() {
        if (exercises.length === 0) {
            modalTitle2 = 'Error';
            modalTexts2 = ['Add at least one exercise'];
            modalOpen2 = true;
            return;
        }
        $WorkoutName = workoutName;
        $WorkoutExercises = JSON.parse(JSON.stringify(exercises));
        $WorkoutCreatedDate = now;
        goto('/logging/workouts/options');
    }
</script>

<svelte:head>
    <title>MyFit | Log workout</title>
</svelte:head>
<MyModal
    modalName="error-modal"
    bind:modalOpen={modalOpen2}
    bind:modalTitle={modalTitle2}
    bind:modalTexts={modalTexts2}
/>
<MyModal bind:modalOpen {modalTitle} {modalTexts}>
    <form class="flex flex-col w-full items-center justify-center" on:submit|preventDefault>
        <div class="flex w-full gap-3">
            <input
                class="w-full text-center text-lg text-accent font-semibold bg-base-100 focus:outline-0 rounded-lg px-0.5"
                type="number"
                min="0"
                max="23"
                value={hours}
                bind:this={hoursInput}
                on:focusout={function focusout({ currentTarget }) {
                    if (
                        currentTarget.value.trim() === '' ||
                        isNaN(parseInt(currentTarget.value)) ||
                        parseInt(currentTarget.value) < 0 ||
                        parseInt(currentTarget.value) > 23
                    ) {
                        currentTarget.value = hours;
                    }
                }}
            />
            <p class="text-3xl font-bold">:</p>
            <input
                class="w-full text-center text-lg text-accent font-semibold bg-base-100 focus:outline-0 rounded-lg px-0.5"
                type="number"
                min="0"
                max="59"
                value={mins}
                bind:this={minsInput}
                on:focusout={function focusout({ currentTarget }) {
                    if (
                        currentTarget.value.trim() === '' ||
                        isNaN(parseInt(currentTarget.value)) ||
                        parseInt(currentTarget.value) < 0 ||
                        parseInt(currentTarget.value) > 59
                    ) {
                        currentTarget.value = mins;
                    }
                }}
            />
        </div>
        <div class="grid grid-cols-2 gap-3 mt-5 w-full">
            <button on:click={saveTime} class="btn btn-accent btn-sm">Save</button>
            <button class="btn btn-error text-white btn-sm" on:click={() => (modalOpen = false)}
                >Cancel</button
            >
        </div>
    </form>
</MyModal>
<MyModal
    modalName="date-modal"
    modalTitle="Change start date"
    modalTexts={[]}
    bind:modalOpen={modalOpen3}
>
    <input type="date" class="bg-base-100 rounded-lg p-2" bind:value={startDateValue} />
    <div class="grid grid-cols-2 gap-3 mt-5 w-full">
        <input type="submit" value="Save" on:click={saveDate} class="btn btn-accent btn-sm" />
        <button class="btn btn-error text-white btn-sm" on:click={() => (modalOpen3 = false)}
            >Cancel</button
        >
    </div>
</MyModal>
<div class="flex justify-around w-full max-w-sm">
    <button class="btn btn-primary btn-sm normal-case" on:click={openTimePicker}
        >Change start time</button
    >
    <button
        class="btn btn-primary btn-sm normal-case"
        on:click={() => {
            modalOpen3 = true;
        }}>Change start date</button
    >
</div>
<ExerciseTable bind:workoutName bind:exercises />
<button class="footer-button" on:click={setWorkoutOptions}> Set workout options </button>
