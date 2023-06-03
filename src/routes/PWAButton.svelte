<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import { registerSW } from 'virtual:pwa-register';
	import MyModal from '../lib/MyModal.svelte';

	function callImmediatelyAndThenSetInterval(func: Function, interval: number) {
		func();
		return setInterval(func, interval);
	}

	let updateAvailable = false;

	const intervalMS = 10 * 1000;
	let updateSW: ((reloadPage?: boolean | undefined) => Promise<void>) | (() => void);

	let isInstalled = true;
	let deferredPrompt: Event;
	onMount(() => {
		updateSW = registerSW({
			onNeedRefresh() {
				updateAvailable = true;
			},
			onRegisteredSW(swUrl, r) {
				r &&
					callImmediatelyAndThenSetInterval(async () => {
						if (!(!r.installing && navigator)) return;

						if ('connection' in navigator && !navigator.onLine) return;

						const resp = await fetch(swUrl, {
							cache: 'no-store',
							headers: {
								cache: 'no-store',
								'cache-control': 'no-cache'
							}
						});

						if (resp?.status === 200) await r.update();
					}, intervalMS);
			}
		});
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			isInstalled = false;
		});
	});
</script>

{#if !isInstalled}
	<li>
		<button
			class="text-accent"
			on:click={() => {
				// Not standard API yet, so need this ignore
				// @ts-ignore
				deferredPrompt.prompt();
			}}>Install</button
		>
	</li>
{:else if updateAvailable}
	<li>
		<MyModal title="Updating">
			<button
                slot="openButton"
				class="text-accent"
				on:click={() => {
					updateSW();
					updateAvailable = false;
				}}>Update</button
			>
            <button class="btn btn-accent normal-case" slot="content">
                <span class="loading loading-spinner"></span>
                Please wait
              </button>
		</MyModal>
	</li>
{/if}