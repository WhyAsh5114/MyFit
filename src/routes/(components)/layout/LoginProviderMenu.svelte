<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import GoogleIcon from 'virtual:icons/mdi/google';
	import GitHubIcon from 'virtual:icons/mdi/github';
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';

	const providerList = [
		{ name: 'google', logo: GoogleIcon },
		{ name: 'github', logo: GitHubIcon }
	];
</script>

<DropdownMenu.Content align="start">
	<DropdownMenu.Group>
		{#each providerList as { name, logo }}
			<DropdownMenu.Item class="gap-2" onclick={() => signIn(name, { callbackUrl: $page.url.pathname })}>
				<svelte:component this={logo} class="h-6 w-6 lg:h-7 lg:w-7" />
				<span class="capitalize">{name}</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Group>
</DropdownMenu.Content>
