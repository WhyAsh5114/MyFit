<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import ModeToggle from '$lib/components/ModeToggle.svelte';

	import UserAvatar from './UserAvatar.svelte';
	import UserDropdown from './UserDropdown.svelte';
	import NavLinks from './NavLinks.svelte';
	import LoginProviderMenu from './LoginProviderMenu.svelte';
	import PWAButtons from './PWAButtons.svelte';

	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { navigating, page } from '$app/stores';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<header class="flex h-screen w-96 flex-col bg-muted p-10">
	<Button class="justify-start gap-2 text-foreground" href="/" variant="link">
		{#if $navigating}
			<div class="flex h-[72px] w-[72px] items-center justify-center">
				<LoaderCircle class="animate-spin text-primary" height={48} width={48} />
			</div>
		{:else}
			<img alt="MyFit logo" height={72} src="/favicon.webp" width={72} />
		{/if}
		<h1 class="text-4xl font-bold">MyFit</h1>
	</Button>
	<NavLinks />
	<div class="flex gap-1">
		<ModeToggle size="lg" variant="outline" />
		<PWAButtons isMobile={false} />
	</div>
	{#if $page.data.session}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button class="mt-1 justify-around" builders={[builder]} size="lg" variant="secondary">
					<UserAvatar session={$page.data.session} />
					<span class="text-base font-semibold">{$page.data.session.user?.name}</span>
				</Button>
			</DropdownMenu.Trigger>
			<UserDropdown />
		</DropdownMenu.Root>
	{:else}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button class="mt-1 justify-around text-base" builders={[builder]} size="lg" variant="outline">Login</Button>
			</DropdownMenu.Trigger>
			<LoginProviderMenu />
		</DropdownMenu.Root>
	{/if}
</header>
<main class="mx-auto flex h-screen w-full max-w-2xl flex-col overflow-y-auto px-2 pb-2 pt-6">
	{@render children()}
</main>
