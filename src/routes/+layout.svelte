<script lang="ts">
    import { page } from '$app/stores';
    import '../app.css';
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
            {#if $page.data.user}
                <li>
                    <a href="/profile">Profile</a>
                </li>
                <li><a href="/profile/settings">Settings</a></li>
                <li><a href="/profile/logout">Logout</a></li>
            {:else}
                <li><a href="/profile/login?page={$page.url.pathname}">Login</a></li>
                <li><a href="/profile/register?page={$page.url.pathname}">Register</a></li>
            {/if}
        </ul>
    </div>
</div>
<div class="flex flex-col place-items-center px-2 pt-0.5 pb-3 flex-grow">
    <slot />
</div>
