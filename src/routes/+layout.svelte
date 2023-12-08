<script lang="ts">
	import "../app.postcss";
	import Hamburger from "virtual:icons/material-symbols/menu";
	import { pwaInfo } from "virtual:pwa-info";
	import PwaButton from "./PWAButton.svelte";
	import UserButton from "./UserButton.svelte";
	import { navigating } from "$app/stores";
	import { onMount } from "svelte";

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";
	let lg: MediaQueryList | undefined = undefined;
	onMount(() => {
		lg = window.matchMedia("(max-width: 1024px)");
	});

	// Vercel analytics
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";
	inject({ mode: dev ? "development" : "production" });
	// Vercel speed insights
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
	injectSpeedInsights();
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

<div class="drawer lg:drawer-open">
	<input id="drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col items-center justify-center h-screen">
		<!-- Page content here -->
		<div class="flex bg-primary w-full items-center py-2 lg:hidden" aria-hidden={!lg?.matches}>
			<label for="drawer" class="btn btn-ghost drawer-button lg:hidden" aria-hidden={!lg?.matches}
				><Hamburger class="w-6 h-6" /></label
			>
			<a href="/" class="flex items-center">
				<img src="/favicon.png" alt="logo" class="-mb-1 mr-1" width="48" height="48" />
				<h1 class="text-2xl font-bold text-white">MyFit</h1>
			</a>
			{#if $navigating}
				<div class="grid w-10 h-10 place-items-center ml-auto px-2">
					<span class="loading loading-ring text-accent"></span>
				</div>
			{/if}
		</div>
		<main class="h-px grow overflow-y-auto p-2 w-full max-w-2xl flex flex-col">
			<slot />
		</main>
	</div>
	<div class="drawer-side z-10">
		<label for="drawer" aria-label="close sidebar" aria-hidden={!lg?.matches} class="drawer-overlay"
		></label>
		<div class="menu p-4 w-80 min-h-full text-base-content bg-primary">
			<!-- Sidebar content here -->
			<ul>
				<li>
					<a class="w-full items-center py-2 hidden lg:flex" href="/">
						<img src="/favicon.png" alt="logo" class="-mb-1 mr-1" width="48" height="48" />
						<h1 class="text-2xl font-bold text-white">MyFit</h1>
						{#if $navigating}
							<div class="grid w-10 h-10 place-items-center ml-auto px-2">
								<span class="loading loading-ring text-accent"></span>
							</div>
						{/if}
					</a>
				</li>
				<li><a href="/mesocycles">Mesocycles</a></li>
				<li><a href="/workouts">Workouts</a></li>
			</ul>
			<div class="flex flex-col gap-2 mt-auto">
				<PwaButton />
				<UserButton />
			</div>
		</div>
	</div>
</div>
