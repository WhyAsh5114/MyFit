<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    export let user: User = data.user;
</script>

<svelte:head>
    <title>MyFit | Profile</title>
</svelte:head>
<div class="flex flex-col w-full place-items-center h-full justify-center gap-3">
    <b>Hi {user.username}</b>
    {#if user.activeSplit}
        <p>Active split: {user.activeSplit}</p>
    {:else}
        <p>No active split</p>
    {/if}
    <a
        class="btn btn-sm normal-case btn-error w-fit"
        href="/profile/logout"
        data-test-id="profile-logout-button">Logout</a
    >
</div>
