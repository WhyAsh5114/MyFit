<script>
  import { page } from "$app/stores";
  import { signOut } from "@auth/sveltekit/client";
</script>

{#if $page.data.session}
  <div class="dropdown dropdown-top">
    <button class="btn btn-neutral flex w-full justify-start h-14">
      <img
        src={$page.data.session.user?.image}
        referrerpolicy="no-referrer"
        alt="profile"
        width="36"
        height="36"
        class="rounded-full avatar"
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
  <a href="/login" class="btn w-full">Login</a>
{/if}
