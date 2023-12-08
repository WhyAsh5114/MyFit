<script>
  import { page } from "$app/stores";
  import { signOut } from "@auth/sveltekit/client";
</script>

{#if $page.data.session}
  <div class="dropdown dropdown-top">
    <button class="btn btn-neutral flex w-full justify-start h-14">
      <img
        class="rounded-full avatar"
        alt="profile"
        height="36"
        referrerpolicy="no-referrer"
        src={$page.data.session.user?.image}
        width="36"
      />
      <span class="grow text-center uppercase font-bold">{$page.data.session.user?.name}</span>
    </button>
    <ul class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-md w-52 my-1">
      <li><a href="/profile">Profile</a></li>
      <li><a href="/settings">Settings</a></li>
      <li><button class="text-error" on:click={() => signOut()}>Logout</button></li>
    </ul>
  </div>
{:else}
  <a class="btn w-full" href="/login">Login</a>
{/if}
