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
	let isOnNewDomain = $state(false);

	onMount(async () => {
		if (data.entityCounts === undefined) {
			entityCounts = null;
			return;
		}
		entityCounts = await data.entityCounts;

		if ('serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.getRegistration();
				if (registration) {
					isOnNewDomain = registration.scope.includes('myfit.fit');
				} else {
					isOnNewDomain = window.location.hostname === 'myfit.fit';
				}
			} catch (error) {
				console.log('Could not check service worker registration:', error);
				isOnNewDomain = window.location.hostname === 'myfit.fit';
			}
		} else {
			isOnNewDomain = window.location.hostname === 'myfit.fit';
		}
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

{#if !dismissDomainMove && !isOnNewDomain}
	<Card.Root class="mt-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
		<Card.Header>
			<Card.Title class="Title text-blue-800 dark:text-blue-200">🚀 MyFit has moved to a new domain!</Card.Title>
			<Card.Description class="text-blue-700 dark:text-blue-300">
				We've moved to <strong>myfit.fit</strong> for a better experience! Please reinstall the app from the new domain to
				ensure you get the latest updates and features.
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
			<Button class="gap-2 bg-blue-600 hover:bg-blue-700" href="https://myfit.fit">
				<ExternalLinkIcon />
				Visit myfit.fit
			</Button>
		</Card.Footer>
	</Card.Root>
{/if}
