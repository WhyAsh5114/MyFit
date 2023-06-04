<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import { registerSW } from 'virtual:pwa-register';
	import MyModal from '../lib/MyModal.svelte';

	function callImmediatelyAndThenSetInterval(func: () => void, interval: number) {
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

	let updatingModal: HTMLDialogElement;
</script>

<MyModal title="Updating" bind:dialogElement={updatingModal}>
	<button class="btn btn-accent normal-case">
		<span class="loading loading-spinner" />
		Please wait
	</button>
</MyModal>
{#if !isInstalled}
	<li>
		<button
			on:click={() => {
				// @ts-expect-error Not standard API yet, so need this ignore
				deferredPrompt.prompt();
			}}>Install</button
		>
	</li>
{:else if updateAvailable}
	<li>
		<button
			on:click={() => {
				updatingModal.show();
				updateSW();
				updateAvailable = false;
			}}>Update</button
		>
	</li>
{/if}
