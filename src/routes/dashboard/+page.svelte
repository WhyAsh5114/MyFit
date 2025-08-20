<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { onMount } from 'svelte';
	import DiscordIcon from 'virtual:icons/ic/baseline-discord';
	import ExternalLinkIcon from 'virtual:icons/lucide/external-link';
	import GetStartedComponent from './(components)/GetStartedComponent.svelte';
	import TodaysWorkoutCard from './(components)/TodaysWorkoutCard.svelte';

	let { data } = $props();
	let entityCounts: RouterOutputs['users']['getEntityCounts'] | undefined = $state(undefined);
	let dismissDiscord = $state(false);
	let dismissDomainMove = $state(false);

	onMount(async () => {
		if (data.entityCounts === undefined) {
			entityCounts = null;
			return;
		}
		entityCounts = await data.entityCounts;
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		dismissDiscord = Boolean(window.localStorage.getItem('discord-dismiss'));
		dismissDomainMove = Boolean(window.localStorage.getItem('domain-move-dismiss'));
	});
</script>

<H2>Home</H2>
<GetStartedComponent {entityCounts} />

<H3>Today's workout</H3>
<TodaysWorkoutCard {...data} />

{#if !dismissDiscord}
	<Card.Root class="mt-2">
		<Card.Header>
			<Card.Title class="Title">We have a Discord</Card.Title>
			<Card.Description>Join to stay updated, connect with others, and get support!</Card.Description>
		</Card.Header>
		<Card.Footer class="flex justify-between">
			<Button
				variant="outline"
				onclick={() => {
					dismissDiscord = true;
					localStorage.setItem('discord-dismiss', 'true');
				}}
			>
				Dismiss
			</Button>
			<Button class="gap-2" href="https://discord.com/invite/2g9YPD6PQu">
				<DiscordIcon />
				Join
			</Button>
		</Card.Footer>
	</Card.Root>
{/if}

{#if !dismissDomainMove}
	<Card.Root class="mt-2">
		<Card.Header>
			<Card.Title class="text-primary">🚀 MyFit has moved to a new domain!</Card.Title>
			<Card.Description>
				We've moved to <strong>myfit.fit</strong> for a better experience! Please install the app from the new domain to
				ensure you get the latest updates and features. Once you've installed from myfit.fit, you can dismiss this message.
			</Card.Description>
		</Card.Header>
		<Card.Footer class="flex justify-between">
			<Button
				variant="outline"
				onclick={() => {
					dismissDomainMove = true;
					localStorage.setItem('domain-move-dismiss', 'true');
				}}
			>
				Dismiss
			</Button>
			<Button class="gap-2" href="https://myfit.fit">
				<ExternalLinkIcon />
				Visit myfit.fit
			</Button>
		</Card.Footer>
	</Card.Root>
{/if}
