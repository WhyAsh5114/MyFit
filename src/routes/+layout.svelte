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
  import { Toaster } from "$lib/components/ui/sonner";
  import { overrideItemIdKeyNameBeforeInitialisingDndZones } from "svelte-dnd-action";
  overrideItemIdKeyNameBeforeInitialisingDndZones("name");

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

<Toaster />
<ModeWatcher />

<div class="flex w-full border-b items-center p-2 gap-1">
  <Sheet.Root>
    <Sheet.Trigger class="pl-2" aria-label="menu">
      <Icon icon="material-symbols:menu" class="w-6 h-6" />
    </Sheet.Trigger>
    <Sheet.Content side="left">
      <Sheet.Title asChild>
        <Button variant="link" class="px-0">
          <a href="/" class="flex items-center gap-2 mb-3">
            <img src="/favicon.webp" alt="logo" width={40} height={40} />
            <span class="text-xl font-bold">MyFit</span>
          </a>
        </Button>
      </Sheet.Title>
      <div class="flex flex-col items-start pl-4">
        <Button variant="link">
          <a href="/workouts">Workouts</a>
        </Button>
        <Button variant="link">
          <a href="/mesocycles">Mesocycles</a>
        </Button>
        <Button variant="link">
          <a href="/exerciseSplits">Exercise splits</a>
        </Button>
        <Button variant="link">
          <a href="/privacyPolicy">Privacy policy</a>
        </Button>
      </div>
    </Sheet.Content>
  </Sheet.Root>
  <a href="/" class="ml-1 mr-auto">
    <img src="/favicon.webp" alt="logo" width={40} height={40} />
  </a>
  <ThemeSwitch />
  <UserButton />
</div>
<div class="flex flex-col h-px grow overflow-y-auto p-1 py-6 px-4">
  <slot />
</div>
