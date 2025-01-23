<script lang="ts">
	import { onMount } from 'svelte';
	import MobileLandingPage from './(components)/page/MobileLandingPage.svelte';
	import DesktopLandingPage from './(components)/page/DesktopLandingPage.svelte';

	let isMobile: undefined | boolean = $state(undefined);
	let { data } = $props();

	onMount(() => {
		isMobile = window.innerWidth < 1024;
		window.addEventListener('resize', () => {
			isMobile = window.innerWidth < 1024;
		});
	});
</script>

{#if isMobile === true}
	<MobileLandingPage {...data} />
{:else if isMobile === false}
	<DesktopLandingPage {...data} />
{/if}
