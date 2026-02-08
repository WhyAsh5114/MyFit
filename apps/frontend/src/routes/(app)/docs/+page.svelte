<script>
	import H1 from '$lib/components/typography/h1.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<H1>{m['nav.docs']()}</H1>

<p class="text-muted-foreground">{m['inProgress']()}</p>
