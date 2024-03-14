<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import Menu from 'lucide-svelte/icons/menu';
	import UserAvatar from './UserAvatar.svelte';
	import UserDropdown from './UserDropdown.svelte';
	import NavLinks from './NavLinks.svelte';
	import LoginProviderMenu from './LoginProviderMenu.svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import PwaButtons from './PWAButtons.svelte';
	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

<ModeWatcher />
<header class="horizontal-screen flex shrink-0 items-center border-b p-1">
	<div class="contents lg:hidden">
		<Sheet.Root>
			<Sheet.Trigger aria-label="Menu" class="px-2">
				<Menu />
			</Sheet.Trigger>
			<Sheet.Content side="left">
				<Sheet.Header class="items-start">
					<Sheet.Title>
						<Button variant="link" class="justify-start">
							<a class="flex items-center gap-2" href="/">
								<img
									class="invert dark:invert-0"
									src="/favicon.webp"
									alt="MyFit logo"
									width={52}
									height={52}
								/>
								<h1 class="text-2xl font-bold">MyFit</h1>
							</a>
						</Button>
					</Sheet.Title>
				</Sheet.Header>
				<NavLinks />
			</Sheet.Content>
		</Sheet.Root>
		<a href="/" class="mx-1 mr-auto">
			<img
				class="invert dark:invert-0"
				src="/favicon.webp"
				alt="MyFit logo"
				width={40}
				height={40}
			/>
		</a>
		<PwaButtons />
		<ModeToggle />
		{#if $page.data.session}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<UserAvatar session={$page.data.session} />
				</DropdownMenu.Trigger>
				<UserDropdown />
			</DropdownMenu.Root>
		{:else}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button size="sm" variant="ghost" builders={[builder]}>Login</Button>
				</DropdownMenu.Trigger>
				<LoginProviderMenu />
			</DropdownMenu.Root>
		{/if}
	</div>
	<div class="hidden h-screen w-full flex-col p-10 lg:flex">
		<Button variant="link" class="justify-start">
			<a class="flex items-center gap-2" href="/">
				<img
					class="invert dark:invert-0"
					src="/favicon.webp"
					alt="MyFit logo"
					width={72}
					height={72}
				/>
				<h1 class="text-4xl font-bold">MyFit</h1>
			</a>
		</Button>
		<NavLinks />
		{#if $page.data.session}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} variant="secondary" class="h-14 justify-around">
						<UserAvatar session={$page.data.session} />
						<span class="text-base font-semibold">{$page.data.session.user?.name}</span>
					</Button>
				</DropdownMenu.Trigger>
				<UserDropdown />
			</DropdownMenu.Root>
		{:else}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button variant="secondary" builders={[builder]} class="h-14 justify-around text-base">
						Login
					</Button>
				</DropdownMenu.Trigger>
				<LoginProviderMenu />
			</DropdownMenu.Root>
		{/if}
	</div>
</header>
<main
	class="mx-auto flex h-px w-full max-w-2xl grow flex-col overflow-y-auto px-2 py-6 lg:h-screen"
>
	<slot />
</main>

<style lang="postcss">
	.horizontal-screen {
		@apply lg:basis-96 lg:border-b-0 lg:border-r;
	}
</style>
