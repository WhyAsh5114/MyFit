<script lang="ts">
	import { onMount } from "svelte";
	import DownloadIcon from "../lib/components/icons/DownloadIcon.svelte";
	import { useRegisterSW } from "virtual:pwa-register/svelte";
	import type { Writable } from "svelte/store";
	import ReloadIcon from "../lib/components/icons/ReloadIcon.svelte";

	let showInstallButton = false;
	// experimental API
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
			onRegistered(r) {
				r &&
					setInterval(() => {
						console.log("Checking for sw update");
						r.update();
					}, 20000 /* 20s for testing purposes */);
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
		<DownloadIcon />
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
			<span class="loading loading-spinner"></span>
		{/if}
	</button>
{/if}
