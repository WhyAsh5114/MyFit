<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    export let user: User | undefined = data.props?.user;

    import LoginButton from '$lib/LoginButton.svelte';
    import RegisterButton from '$lib/RegisterButton.svelte';
    import '../app.css';
    import { goto } from '$app/navigation';

    async function logout() {
        await fetch('/api/auth/logout', {
            method: 'GET'
        });
        goto('/profile/login');
    }
</script>

<div class="navbar bg-base-100 gap-2 md:h-20 lg:h-24">
    <a
        class="btn h-full normal-case text-xl md:text-2xl lg:text-4xl btn-primary flex-grow gap-2"
        href="/"
    >
        <img src="/favicon.png" alt="logo" width="40" />
        MyFit
    </a>
    <div class="dropdown dropdown-end ml-auto h-full">
        <button
            tabindex="0"
            class="btn btn-primary btn-square lg:px-1.5 h-full avatar lg:w-20"
            data-test-id="dropdown-button"
        >
            <div class="rounded-full w-8 md:w-9 lg:w-12">
                <img src="/profile.png" alt="profile-pic" />
            </div>
        </button>
        <ul
            tabindex="0"
            class="mt-3 md:p-1 lg:p-2 shadow menu menu-compact dropdown-content bg-secondary text-black font-semibold rounded-md"
            data-test-id="profile-options-dropdown"
        >
            {#if user}
                <li>
                    <a href="/profile">Profile</a>
                </li>
                <li><a href="/profile/settings">Settings</a></li>
                <li><button on:click={logout}>Logout</button></li>
            {:else}
                <li><LoginButton /></li>
                <li><RegisterButton /></li>
            {/if}
        </ul>
    </div>
</div>
<div class="flex flex-col place-items-center px-2 pt-0.5 pb-3 flex-grow">
    <slot />
</div>
