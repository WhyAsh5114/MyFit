<script lang="ts">
	import { useRegisterSW } from "virtual:pwa-register/svelte";
	const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
		onRegistered(r) {
			r &&
				setInterval(() => {
					console.log("Checking for sw update");
					r.update();
				}, 20000 /* 2s for testing purposes */);
			console.log(`SW Registered: ${r}`);
		},
		onRegisterError(error) {
			console.log("SW registration error", error);
		}
	});
	const close = () => {
		offlineReady.set(false);
		needRefresh.set(false);
	};
	$: toast = $offlineReady || $needRefresh;
</script>

{#if toast}
	<div class="toast" role="alert">
		<div class="alert bg-primary flex">
			{#if $offlineReady}
				<span> App ready to work offline </span>
			{:else}
				<span> New version available </span>
			{/if}
			{#if $needRefresh}
				<button class="btn btn-circle btn-sm btn-accent" on:click={() => updateServiceWorker(true)}>
					&#8635;
				</button>
			{/if}
			<button class="btn btn-circle btn-sm btn-error text-black" on:click={close}>
				&#x2715;
			</button>
		</div>
	</div>
{/if}
