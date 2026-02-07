<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import { m } from '$lib/paraglide/messages';
	import BetaCard from './components/beta-card.svelte';
</script>

<H1>{m['nav.dashboard']()}</H1>

<BetaCard />
