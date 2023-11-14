<script>
	import "../app.postcss";
	import Hamburger from "$lib/components/icons/Hamburger.svelte";
	import { pwaInfo } from "virtual:pwa-info";
	import PwaButton from "./PWAButton.svelte";
	import UserButton from "./UserButton.svelte";

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

<div class="drawer lg:drawer-open">
	<input id="drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col items-center justify-center h-screen">
		<!-- Page content here -->
		<div class="flex bg-primary w-full items-center py-2 lg:hidden">
			<label for="drawer" class="btn btn-ghost drawer-button lg:hidden"><Hamburger /></label>
			<a href="/" class="flex items-center">
				<img src="/favicon.png" alt="logo" class="w-12 -mb-1 mr-1" />
				<h1 class="text-2xl font-bold text-white">MyFit</h1>
			</a>
		</div>
		<main class="h-px grow overflow-y-auto p-2 w-full max-w-2xl flex flex-col">
			<slot />
		</main>
	</div>
	<div class="drawer-side z-10">
		<label for="drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="menu p-4 w-80 min-h-full text-base-content bg-primary">
			<!-- Sidebar content here -->
			<ul>
				<li>
					<a class="w-full items-center py-2 hidden lg:flex" href="/">
						<img src="/favicon.png" alt="logo" class="w-12 -mb-1 mr-1" />
						<h1 class="text-2xl font-bold text-white">MyFit</h1>
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
