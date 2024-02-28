<script lang="ts">
  import { onMount } from "svelte";
  import { useRegisterSW } from "virtual:pwa-register/svelte";
  import type { Writable } from "svelte/store";
  import Icon from "@iconify/svelte";

  let deferredPrompt: Event | null;
  let needRefresh: Writable<boolean>;
  let offlineReady: Writable<boolean>;
  let showInstallButton = false;
  let updateServiceWorker: (_arg0: boolean) => void;
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
            // eslint-disable-next-line svelte/@typescript-eslint/no-unnecessary-condition
            if (!(!r.installing && navigator)) {
              return;
            }
            if ("connection" in navigator && !navigator.onLine) {
              return;
            }
            const resp = await fetch(swUrl, {
              cache: "no-store",
              headers: {
                cache: "no-store",
                "cache-control": "no-cache"
              }
            });
            if (resp.status === 200) {
              await r.update();
            }
          }, 600000 /* Every 10 minutes */);
        console.log(`SW Registered: ${r}`);
      },
      onRegisterError(error) {
        console.log("SW registration error", error);
      }
    }));
  });

  let reloading = false;
</script>

<div class="join grid" class:grid-cols-2={showInstallButton && $needRefresh}>
  {#if showInstallButton}
    <button
      class="join-item btn btn-accent"
      on:click={() => {
        // @ts-expect-error Not standard API yet, so need this ignore
        deferredPrompt.prompt();
        deferredPrompt = null;
      }}
    >
      <Icon icon="material-symbols:download" class="w-6 h-6" />
      Install
    </button>
  {/if}
  {#if $needRefresh}
    <button
      class="join-item btn btn-neutral gap-4"
      on:click={() => {
        updateServiceWorker(true);
        reloading = true;
      }}
    >
      {#if !reloading}
        <Icon icon="tabler:reload" />
        Update
      {:else}
        <span class="loading loading-spinner" />
      {/if}
    </button>
  {/if}
</div>
