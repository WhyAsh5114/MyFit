<script lang="ts">
    import HomepageButton from '../lib/HomepageButton.svelte';
    import { page } from '$app/stores';

    let userData: User | undefined;
    $: userData = $page.data.user;

    let todaysWorkout: string | undefined;
    $: if (userData?.activeSplit) {
        todaysWorkout = userData?.splits[userData?.activeSplit].schedule.at(
            new Date().getDay() - 1
        );
        console.log(todaysWorkout);
    }
</script>

<svelte:head>
    <title>MyFit</title>
</svelte:head>
<div class="flex flex-col gap-3 w-5/6 md:w-2/3 max-w-sm justify-center items-center flex-grow">
    {#if userData}
        <p class="text-center">
            {#if Object.keys(userData.splits).length === 0}
                <b>Hi {userData.username}!</b><br /> You haven't created a schedule yet, create one
                in <a href="/splits/new"><b>Splits > New split</b></a>
            {:else if !userData.activeSplit}
                <b>Hi {userData.username}!</b><br />
                You don't have an active split, you can select one from <a href="records/splits"><b>Records > Splits</b></a>
                or create a new one in <a href="/splits/new"><b>Splits > New split</b></a>
            {:else}
                <b>Hi {userData.username}!</b><br />
                Your currently active split is <b>{userData.activeSplit}</b><br />
                {#if todaysWorkout !== 'Rest'}
                    Today you have <b>{todaysWorkout}</b> workout
                {:else}
                    Today you have a Rest day!
                {/if}
            {/if}
        </p>
    {:else}
        <p class="text-center md:text-lg">
            <b>Hi there!</b><br /> You haven't logged in yet, login to use all the features of the app
        </p>
        <div class="w-full h-px bg-white" />
        <div class="flex flex-col gap-2 justify-evenly w-1/2">
            <a href="/profile/login?page={$page.url.pathname}" class="btn btn-sm btn-secondary"
                >Login</a
            >
            <a href="/profile/register?page={$page.url.pathname}" class="btn btn-sm btn-secondary"
                >Register</a
            >
        </div>
    {/if}
</div>
<div class="grid grid-cols-2 gap-3 lg:grid-cols-4 w-full">
    <HomepageButton title="Splits" imagePath="/calendar.svg" link="/splits" />
    <HomepageButton title="Logging" imagePath="/pencil.svg" link="/logging" />
    <HomepageButton title="Records" imagePath="/record.svg" link="/records" />
    <HomepageButton title="Tracking" imagePath="/graph.svg" link="/tracking" />
</div>
