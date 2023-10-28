<script lang="ts">
	import { navigating, page } from '$app/stores';
	import '../app.postcss';
	import Navbar from './Navbar.svelte';

	import { pwaInfo } from 'virtual:pwa-info';
	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

	let drawerLinks = [
		{ name: 'Mesocycles', link: '/mesocycles' },
		{ name: 'Workouts', link: '/workouts' },
		{ name: 'Calculators', link: '/calculators' }
	];
</script>

<svelte:head>
	{@html webManifestLink}
	<title>MyFit</title>
</svelte:head>

<div class="drawer lg:drawer-open h-full">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col items-center">
		<!-- Page content here -->
		<Navbar />
		<div class="h-px grow flex flex-col justify-center items-center p-1 w-full max-w-lg">
			<slot />
		</div>
	</div>
	<div class="drawer-side z-30">
		<label for="my-drawer" class="drawer-overlay" />
		<ul class="menu p-4 lg:w-72 w-4/6 min-h-full bg-neutral text-base-content font-semibold">
			<!-- Sidebar content here -->
			<a class="flex btn btn-ghost justify-start gap-0" href="/">
				<div class="h-10 w-10 relative mt-1 -ml-2">
					{#if $navigating?.to}
						<div class="w-10 h-10 absolute z-20 grid place-items-center">
							<span class="loading loading-spinner text-accent" />
						</div>
					{:else}
						<img src="/logo_no_bg.png" alt="" class="absolute" width="40" height="40" />
					{/if}
				</div>
				<h1 class="text-3xl normal-case font-bold {$page.url.pathname === '/' ? 'text-accent' : 'text-white'}">
					MyFit
				</h1>
			</a>
			{#each drawerLinks as { name, link }}
				{#if $page.url.pathname.startsWith(link)}
					<li class="text-accent">
						<a href={link}>{name}</a>
					</li>
				{:else}
					<li><a href={link}>{name}</a></li>
				{/if}
			{/each}
		</ul>
	</div>
</div>
