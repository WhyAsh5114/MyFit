<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';
    export let data: PageData;
    export let user: User = data.user;

    async function logout() {
        await fetch('/api/auth/logout', {
            method: 'GET'
        });
        await goto('/profile/login');
        await invalidateAll();
    }
</script>

<svelte:head>
    <title>MyFit | Profile</title>
</svelte:head>
<div class="flex flex-col w-full place-items-center h-full justify-center gap-3">
    <p>Hi {user.username}</p>
    {#if user.activeSplit}
        <p>Active split: {user.activeSplit}</p>
    {:else}
        <p>No active split</p>
    {/if}
    <button
        class="btn btn-sm normal-case btn-error w-fit"
        on:click={logout}
        data-test-id="profile-logout-button">Logout</button
    >
</div>
