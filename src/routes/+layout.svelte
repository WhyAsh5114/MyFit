<script lang="ts">
  import "../app.postcss";
  import { pwaInfo } from "virtual:pwa-info";
  import PwaButtons from "./PWAButtons.svelte";
  import UserButton from "./UserButton.svelte";
  import { navigating, page } from "$app/stores";
  import { onMount } from "svelte";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import Icon from "@iconify/svelte";
  import { ModeWatcher } from "mode-watcher";
  import ThemeSwitch from "$lib/components/ThemeSwitch.svelte";

  let drawerOpen = false;

  // eslint-disable-next-line svelte/no-immutable-reactive-statements
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";
  let lg: MediaQueryList | undefined;
  onMount(() => {
    lg = window.matchMedia("(max-width: 1024px)");
  });

  // Vercel analytics and speed insights
  import { dev } from "$app/environment";
  import { inject } from "@vercel/analytics";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

  if ($page.url.hostname !== "localhost") {
    console.log("Vercel insights and analytics enabled");
    inject({ mode: dev ? "development" : "production" });
    injectSpeedInsights();
  }

  $: if ($navigating?.complete) closeDrawer($navigating.complete);
  async function closeDrawer(navPromise: Promise<void>) {
    await navPromise;
    drawerOpen = false;
  }
</script>

<svelte:head>
  {@html webManifestLink}
</svelte:head>

<ModeWatcher />
<div class="flex w-full border-b items-center p-2 gap-1">
  <Sheet.Root>
    <Sheet.Trigger>
      <Button variant="ghost" class="px-2">
        <Icon icon="mdi:menu" width={20} height={20} />
      </Button>
    </Sheet.Trigger>
    <Sheet.Content side="left">
      <Sheet.Header>
        <Sheet.Title>Are you sure absolutely sure?</Sheet.Title>
        <Sheet.Description>
          This action cannot be undone. This will permanently delete your account and remove your
          data from our servers.
        </Sheet.Description>
      </Sheet.Header>
    </Sheet.Content>
  </Sheet.Root>
  <a href="/" class="ml-1 mr-auto">
    <img src="/favicon.png" alt="logo" width={40} height={40} />
  </a>
  <ThemeSwitch />
  <UserButton />
</div>
<!-- <div class="drawer lg:drawer-open">
	<input id="drawer" class="drawer-toggle" type="checkbox" bind:checked={drawerOpen} />
	<div class="drawer-content flex flex-col items-center justify-center h-screen">
		Page content here
		<div class="flex bg-primary w-full items-center py-2 lg:hidden" aria-hidden={!lg?.matches}>
			<label class="btn btn-ghost drawer-button lg:hidden" aria-hidden={!lg?.matches} for="drawer">
				<Hamburger class="w-6 h-6" />
			</label>
			<a class="flex items-center" href="/">
				<img class="-mb-1 mr-1" alt="logo" height="48" src="/favicon.png" width="48" />
				<h1 class="text-2xl font-bold text-white">MyFit</h1>
			</a>
			{#if $navigating}
				<div class="grid w-10 h-10 place-items-center ml-auto px-2">
					<span class="loading loading-ring text-accent" />
				</div>
			{/if}
		</div>
		<main class="h-px grow overflow-y-auto p-2 w-full max-w-2xl flex flex-col">
			<slot />
		</main>
	</div>
	<div class="drawer-side z-10">
		<label
			class="drawer-overlay"
			aria-hidden={!lg?.matches}
			aria-label="close sidebar"
			for="drawer"
		/>
		<div class="menu p-4 w-80 min-h-full text-base-content bg-primary">
			Sidebar content here
			<ul>
				<li>
					<a class="w-full items-center py-2 hidden lg:flex" href="/">
						<img class="-mb-1 mr-1" alt="logo" height="48" src="/favicon.png" width="48" />
						<h1 class="text-2xl font-bold text-white">MyFit</h1>
						{#if $navigating}
							<div class="grid w-10 h-10 place-items-center ml-auto px-2">
								<span class="loading loading-ring text-accent" />
							</div>
						{/if}
					</a>
				</li>
				<li><a href="/workouts">Workouts</a></li>
				<li><a href="/mesocycles">Mesocycles</a></li>
				<li><a href="/exerciseSplits">Exercise splits</a></li>
				<li><a href="/privacyPolicy">Privacy policy</a></li>
			</ul>
			<div class="flex flex-col gap-2 mt-auto">
				<PwaButtons />
				<UserButton />
			</div>
		</div>
	</div>
</div> -->
