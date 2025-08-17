<script>
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { FastForwardIcon, SmartphoneIcon } from '@lucide/svelte';
</script>

<H1>Dashboard</H1>

<Card.Root>
	<Card.Header>
		<Card.Title>Quickstart</Card.Title>
		<Card.Description>Quickly get up and running with templates and programs!</Card.Description>
		<Card.Action>
			<Button size="icon" href="/quickstart">
				<FastForwardIcon />
			</Button>
		</Card.Action>
	</Card.Header>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>Platform sync</Card.Title>
		<Card.Description>Sync your data with the platform using the Health plugin.</Card.Description>
		<Card.Action>
			<Button size="icon" href="/sync">
				<SmartphoneIcon />
			</Button>
		</Card.Action>
	</Card.Header>
</Card.Root>
