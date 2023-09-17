<script lang="ts">
	import { page } from '$app/stores';
	import '../app.postcss';
	import Navbar from './Navbar.svelte';

	import { pwaInfo } from 'virtual:pwa-info';
	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

	let drawerLinks = [
		{ name: 'Mesocycles', link: '/mesocycles' },
		{ name: 'Workouts', link: '/workouts' }
	];
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

<div class="drawer h-full">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Page content here -->
		<Navbar />
		<div class="h-px grow flex flex-col justify-center items-center m-1">
			<slot />
		</div>
	</div>
	<div class="drawer-side">
		<label for="my-drawer" class="drawer-overlay" />
		<ul class="menu p-4 w-64 min-h-full bg-neutral text-base-content font-semibold">
			<!-- Sidebar content here -->
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
