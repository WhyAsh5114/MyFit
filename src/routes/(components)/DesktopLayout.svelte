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
	<Button variant="link" class="justify-start gap-2 text-foreground" href="/">
		{#if $navigating}
			<div class="flex h-[72px] w-[72px] items-center justify-center">
				<LoaderCircle width={48} height={48} class="animate-spin text-primary" />
			</div>
		{:else}
			<img src="/favicon.webp" alt="MyFit logo" width={72} height={72} />
		{/if}
		<h1 class="text-4xl font-bold">MyFit</h1>
	</Button>
	<NavLinks />
	<div class="flex gap-1">
		<ModeToggle variant="outline" size="lg" />
		<PWAButtons isMobile={false} />
	</div>
	{#if $page.data.session}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="secondary" size="lg" class="mt-1 justify-around">
					<UserAvatar session={$page.data.session} />
					<span class="text-base font-semibold">{$page.data.session.user?.name}</span>
				</Button>
			</DropdownMenu.Trigger>
			<UserDropdown />
		</DropdownMenu.Root>
	{:else}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button
					variant="outline"
					builders={[builder]}
					size="lg"
					class="mt-1 justify-around text-base"
				>
					Login
				</Button>
			</DropdownMenu.Trigger>
			<LoginProviderMenu />
		</DropdownMenu.Root>
	{/if}
</header>
<main class="mx-auto flex h-screen w-full max-w-2xl flex-col overflow-y-auto px-2 pb-2 pt-6">
	{@render children()}
</main>
