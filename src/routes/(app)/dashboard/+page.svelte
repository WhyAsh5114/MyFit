<script>
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { FastForwardIcon } from 'lucide-svelte';
</script>

<H1>Dashboard</H1>

<Card.Root>
	<Card.Content class="flex items-center justify-between gap-2">
		<div class="flex flex-col">
			<span class="text-lg font-semibold">Quickstart</span>
			<p class="text-muted-foreground text-sm">
				Quickly get up and running with templates and programs!
			</p>
		</div>
		<Button size="icon" class="shrink-0" href="/quickstart">
			<FastForwardIcon />
		</Button>
	</Card.Content>
</Card.Root>
