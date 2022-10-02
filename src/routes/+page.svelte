<script lang="ts">
    import HomepageButton from '../lib/HomepageButton.svelte';
    import { page } from '$app/stores';
</script>

<svelte:head>
    <title>MyFit</title>
</svelte:head>
<div class="flex flex-col gap-3 w-5/6 md:w-2/3 max-w-sm justify-center items-center flex-grow">
    {#if $page.data.user}
        <h3 class="text-center">
            <b>Hi {$page.data.user.username}!</b><br /> You haven't created a schedule yet, create
            one in
            <b>Splits</b>
        </h3>
    {:else}
        <h3 class="text-center md:text-lg">
            <b>Hi there!</b><br /> You haven't logged in yet, login to use all the features of the app
        </h3>
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
