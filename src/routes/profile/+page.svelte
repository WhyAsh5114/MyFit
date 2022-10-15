<script lang="ts">
    import { page } from '$app/stores';
</script>

<svelte:head>
    <title>MyFit | Profile</title>
</svelte:head>
<div class="flex flex-col w-full place-items-center h-full justify-center gap-3">
    <b>Hi {$page.data.user?.username}</b>
    {#if $page.data.user?.activeSplit}
        <p>Active split: <b data-test-id="active-split">{$page.data.user?.activeSplit}</b></p>
    {:else}
        <p data-test-id="no-active-split">No active split</p>
    {/if}
    <a
        class="btn btn-sm normal-case btn-error w-fit"
        href="/profile/logout"
        data-test-id="profile-logout-button">Logout</a
    >
</div>
