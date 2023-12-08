<script lang="ts">
  import { onMount } from "svelte";
  import DownloadIcon from "virtual:icons/material-symbols/download";
  import { useRegisterSW } from "virtual:pwa-register/svelte";
  import type { Writable } from "svelte/store";
  import ReloadIcon from "virtual:icons/tabler/reload";

  let showInstallButton = false;
  let deferredPrompt: Event | null;
  let needRefresh: Writable<boolean>;
  let offlineReady: Writable<boolean>;
  let updateServiceWorker: (arg0: boolean) => void;
  onMount(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallButton = true;
    });
    window.addEventListener("appinstalled", () => {
      showInstallButton = false;
      deferredPrompt = null;
    });

    ({ needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
      onRegisteredSW(swUrl, r) {
        r &&
          setInterval(async () => {
            if (!(!r.installing && navigator)) return;
            if ("connection" in navigator && !navigator.onLine) return;
            const resp = await fetch(swUrl, {
              cache: "no-store",
              headers: {
                cache: "no-store",
                "cache-control": "no-cache"
              }
            });
            if (resp.status === 200) await r.update();
          }, 600000 /* every 10 minutes */);
        console.log(`SW Registered: ${r}`);
      },
      onRegisterError(error) {
        console.log("SW registration error", error);
      }
    }));
  });

  let reloading = false;
</script>

{#if showInstallButton}
  <button
    class="btn btn-accent mt-auto"
    on:click={() => {
      // @ts-expect-error Not standard API yet, so need this ignore
      deferredPrompt.prompt();
      deferredPrompt = null;
    }}
  >
    <DownloadIcon class="w-6 h-6" />
    Install app
  </button>
{:else if $offlineReady}
  App ready to work offline
{:else if $needRefresh}
  <button
    class="btn btn-accent gap-4"
    on:click={() => {
      updateServiceWorker(true);
      reloading = true;
    }}
  >
    {#if !reloading}
      <ReloadIcon />
      Update available
    {:else}
      <span class="loading loading-spinner" />
    {/if}
  </button>
{/if}
