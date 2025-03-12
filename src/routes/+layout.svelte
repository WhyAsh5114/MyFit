<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>MyFit</title>
	<link rel="manifest" href="/manifest.json" />
	<meta name="application-name" content="MyFit" />
	<meta name="description" content="Most comprehensive fitness platform ever!" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<ModeWatcher />
{@render children()}
