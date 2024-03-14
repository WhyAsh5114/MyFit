<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';
	import GoogleIcon from 'virtual:icons/mdi/google';
	import GitHubIcon from 'virtual:icons/mdi/github';

	const providerList = [
		{ name: 'google', logo: GoogleIcon },
		{ name: 'github', logo: GitHubIcon }
	];
</script>

<DropdownMenu.Content class="lg:w-[295px]">
	<DropdownMenu.Group>
		{#each providerList as { name, logo }}
			<DropdownMenu.Item
				class="gap-2"
				on:click={() => {
					signIn(name, { callbackUrl: $page.url.searchParams.get('callbackURL') || '' });
				}}
			>
				<svelte:component this={logo} class="h-6 w-6 lg:h-7 lg:w-7" />
				<span class="capitalize">{name}</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Group>
</DropdownMenu.Content>
