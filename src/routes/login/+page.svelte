<script lang="ts">
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import { signIn } from "@auth/sveltekit/client";
  import GoogleLogo from "virtual:icons/ri/google-fill";

  let redirectingModal: HTMLDialogElement;
  $: ({ url } = $page);
</script>

<svelte:head>
  <title>MyFit | Login</title>
</svelte:head>

<MyModal title="Redirecting" bind:dialogElement={redirectingModal}>
  <button class="btn btn-accent normal-case">
    <span class="loading loading-spinner" />
    Please wait
  </button>
</MyModal>
<div
  class="flex flex-col items-center bg-secondary rounded-lg py-5 px-10 gap-3 w-full max-w-xs m-auto"
>
  <h3 class="text-black font-semibold">Login to continue</h3>
  <button
    class="btn gap-2 btn-primary normal-case w-full"
    on:click={() => {
      redirectingModal.show();
      signIn("google", { callbackUrl: url.searchParams.get("callbackURL") || "" });
    }}
  >
    <GoogleLogo class="h-6 w-6 mx-2" />
    Sign in with Google
  </button>
</div>
