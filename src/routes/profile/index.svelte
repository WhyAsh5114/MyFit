<script context="module" lang="ts">
    export { loadUserOrRedirectToLogin as load } from '$lib/loadUserOrRedirectToLogin';
</script>

<script lang="ts">
    export let user: UserData;

    async function logout() {
        await fetch('/api/auth/logout', {
            method: 'GET'
        });
        // TODO: fix (change to goto()) once SvelteKit solves #4426
        window.location.href = '/profile/login';
    }
</script>

<svelte:head>
    <title>MyFit | Profile</title>
</svelte:head>
<div class="flex flex-col w-full place-items-center h-full justify-center gap-3">
    <p>Hi {user.username}</p>
    <button
        class="btn btn-sm normal-case btn-error w-fit"
        on:click={logout}
        data-test-id="profile-logout-button">Logout</button
    >
</div>
