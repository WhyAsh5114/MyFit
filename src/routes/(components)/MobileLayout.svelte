<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import ModeToggle from '$lib/components/ModeToggle.svelte';

	import UserAvatar from './UserAvatar.svelte';
	import UserDropdown from './UserDropdown.svelte';
	import NavLinks from './NavLinks.svelte';
	import LoginProviderMenu from './LoginProviderMenu.svelte';
	import PWAButtons from './PWAButtons.svelte';

	import MenuIcon from 'virtual:icons/lucide/menu';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { navigating, page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';

	let { children }: { children: Snippet } = $props();
	let sheetOpen = $state(false);
</script>

<header class="flex shrink-0 items-center gap-2 border-b bg-muted p-1">
	<Sheet.Root bind:open={sheetOpen}>
		<Sheet.Trigger class="px-2" aria-label="Menu">
			<MenuIcon />
		</Sheet.Trigger>
		<Sheet.Content side="left">
			<Sheet.Header class="items-start">
				<Sheet.Title>
					<Button
						class="justify-start gap-2 text-foreground"
						onclick={async () => {
							await goto('/');
							sheetOpen = false;
						}}
						variant="link"
					>
						<img alt="MyFit logo" height={52} src="/favicon.webp" width={52} />
						<h1 class="text-2xl font-bold">MyFit</h1>
					</Button>
				</Sheet.Title>
			</Sheet.Header>
			<NavLinks bind:sheetOpen />
		</Sheet.Content>
	</Sheet.Root>
	<a class="mx-1 mr-auto" href="/">
		{#if $navigating}
			<div class="flex h-10 w-10 items-center justify-center">
				<LoaderCircle class="animate-spin text-primary" height={24} width={24} />
			</div>
		{:else}
			<img alt="MyFit logo" height={40} src="/favicon.webp" width={40} />
		{/if}
	</a>
	<PWAButtons isMobile={true} />
	<ModeToggle />
	{#if $page.data.session}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button size="icon" variant="ghost">
					<UserAvatar session={$page.data.session} />
				</Button>
			</DropdownMenu.Trigger>
			<UserDropdown />
		</DropdownMenu.Root>
	{:else}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} size="sm" variant="ghost">Login</Button>
			</DropdownMenu.Trigger>
			<LoginProviderMenu />
		</DropdownMenu.Root>
	{/if}
</header>
<main class="mx-auto flex h-px w-full max-w-2xl grow flex-col overflow-y-auto px-2 pb-2 pt-6">
	{@render children()}
</main>
