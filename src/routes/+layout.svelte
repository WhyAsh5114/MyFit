<script lang="ts">
	import '../app.postcss';
	import { pwaInfo } from 'virtual:pwa-info';
	import Navbar from './Navbar.svelte';

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
	{@html webManifest}
	<title>MyFit</title>
</svelte:head>

<Navbar />
<main class="flex flex-col h-full justify-center items-center">
	<slot />
</main>
