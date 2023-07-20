<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import type { Writable } from 'svelte/store';

	function callImmediatelyAndThenSetInterval(func: () => void, interval: number) {
		func();
		return setInterval(func, interval);
	}

	let isInstalled = true;
	let deferredPrompt: Event | null;
	let needRefresh: Writable<boolean>;
	let updateServiceWorker: (arg0: boolean) => void;
	onMount(() => {
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			isInstalled = false;
		});
		window.addEventListener('appinstalled', () => {
			isInstalled = true;
			deferredPrompt = null;
		});
		({ needRefresh, updateServiceWorker } = useRegisterSW({
			onRegistered(r) {
				r &&
					callImmediatelyAndThenSetInterval(() => {
						console.log('Checking for sw update');
						r.update();
					}, 20000);
				console.log(`SW Registered: ${r}`);
			},
			onRegisterError(error) {
				console.log('SW registration error', error);
			}
		}));
	});

	export let updatingModal: HTMLDialogElement;
	export let showIndicator: boolean;
	$: showIndicator = $needRefresh || !isInstalled;
</script>

{#if !isInstalled}
	<li>
		<button
			on:click={async () => {
				// @ts-expect-error Not standard API yet, so need this ignore
				deferredPrompt.prompt();
				deferredPrompt = null;
			}}>Install</button
		>
	</li>
{:else if $needRefresh}
	<li>
		<button
			on:click={() => {
				updatingModal.show();
				updateServiceWorker(true);
				needRefresh.set(false);
			}}>Update</button
		>
	</li>
{/if}
