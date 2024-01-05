<script lang="ts">
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import { signIn } from "@auth/sveltekit/client";
  import GoogleLogo from "virtual:icons/ri/google-fill";
  import GitHubLogo from "virtual:icons/mdi/github";

  let redirectingModal: HTMLDialogElement;
  $: ({ url } = $page);

  const providerList = [
    { name: "google", logo: GoogleLogo },
    { name: "github", logo: GitHubLogo }
  ];
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

<h2>Login</h2>
<div class="flex flex-col items-center rounded-lg gap-1 w-full max-w-sm m-auto">
  {#each providerList as { name, logo }}
    <button
      class="btn gap-2 btn-primary normal-case w-full justify-evenly"
      on:click={() => {
        redirectingModal.show();
        signIn(name, { callbackUrl: url.searchParams.get("callbackURL") || "" });
      }}
    >
      <svelte:component this={logo} class="h-7 w-7" />
      <span>Sign in with <span class="capitalize">{name}</span></span>
    </button>
  {/each}
</div>
