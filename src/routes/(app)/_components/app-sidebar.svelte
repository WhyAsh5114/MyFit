<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth/auth-client';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { SIDEBAR_LINK_GROUPS } from '$lib/constants';
	import { client } from '$lib/idb-client';
	import {
		ChevronUpIcon,
		DownloadIcon,
		LoaderCircleIcon,
		LogInIcon,
		RefreshCcwIcon,
		UserRoundIcon
	} from '@lucide/svelte';
	import { appLayoutState } from '../../_components/app-layout-state.svelte';

	const sidebar = useSidebar();
	const session = authClient.useSession();

	let currentPlatform = $state<'Android' | 'iOS'>();

	$effect(() => {
		const userAgent = navigator.userAgent;
		if (/iPad|iPhone|iPod/.test(userAgent)) currentPlatform = 'iOS';
		if (/android/i.test(userAgent)) currentPlatform = 'Android';
	});

	function installApp() {
		if (currentPlatform === undefined) return appLayoutState.deferredPrompt?.prompt();

		const link = document.createElement('a');
		if (currentPlatform === 'Android') {
			link.href = '/native/myfit-android-debug.apk';
			link.download = 'myfit-android-debug.apk';
		} else if (currentPlatform === 'iOS') {
			link.href = '/native/myfit-ios.ipa';
			link.download = 'myfit-ios.ipa';
		}
		link.click();
	}
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					class="bg-card h-fit w-full justify-start text-start"
					onclick={() => sidebar.setOpenMobile(false)}
				>
					<a
						class="flex w-full items-center gap-2 px-2 py-0 text-xl font-semibold"
						href={resolve('/')}
					>
						<img src="/favicon.png" alt="logo" class="h-12 w-12" />
						MyFit <span class="ml-auto font-mono text-sm font-normal">.fit</span>
					</a>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		{#each SIDEBAR_LINK_GROUPS as linkGroup (linkGroup.label)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{linkGroup.label}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each linkGroup.items as link (link.label)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									onclick={() => sidebar.setOpenMobile(false)}
									isActive={page.url.pathname.startsWith(link.href)}
								>
									{#snippet child({ props })}
										{#if link.label === 'Github' || link.label === 'Discord'}
											<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
											<a href={link.href} target="_blank" {...props}>
												<link.icon />
												<span>{link.label}</span>
											</a>
										{:else}
											<a href={resolve(link.href)} {...props}>
												<link.icon />
												<span>{link.label}</span>
											</a>
										{/if}
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu class="flex w-full flex-row">
			<Sidebar.MenuItem class="grow">
				{#if $session.isPending || $session.isRefetching}
					<Sidebar.MenuButton variant="outline" class="justify-center">
						<LoaderCircleIcon class="animate-spin" />
					</Sidebar.MenuButton>
				{:else if !$session.data}
					<Sidebar.MenuButton variant="outline">
						{#snippet child({ props })}
							<a {...props} href={resolve('/login')}>
								<LogInIcon /> Login
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				{:else}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton variant="outline" {...props}>
									<UserRoundIcon />
									{$session.data!.user.name}
									<ChevronUpIcon class="ml-auto" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width)">
							<DropdownMenu.Group>
								<DropdownMenu.Item onclick={() => sidebar.setOpenMobile(false)}>
									{#snippet child({ props })}
										<a href={resolve('/profile')} {...props}><UserRoundIcon /> Profile</a>
									{/snippet}
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="text-destructive"
									onclick={() => {
										authClient.signOut();
										localStorage.clear();
										client.resetDatabase();
									}}
								>
									<LogInIcon />
									Logout
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}
			</Sidebar.MenuItem>
			<Sidebar.MenuItem>
				{#if appLayoutState.updateServiceWorkerFunction}
					<Sidebar.MenuButton
						aria-label="Update app"
						variant="outline"
						onclick={(e) => {
							e.currentTarget.blur();
							appLayoutState.updateDialogOpen = true;
						}}
					>
						<RefreshCcwIcon />
						Update
					</Sidebar.MenuButton>
				{:else if appLayoutState.deferredPrompt}
					<Sidebar.MenuButton aria-label="Install app" onclick={installApp} variant="outline">
						<DownloadIcon />
						Install
					</Sidebar.MenuButton>
				{/if}
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
