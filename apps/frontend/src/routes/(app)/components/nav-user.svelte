<script lang="ts">
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { m } from '$lib/paraglide/messages';
	import { LogInIcon } from '@lucide/svelte';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	const sidebar = useSidebar();
	let authData = authClient.useSession();

	let user = $derived($authData.data?.user);

	function getInitials(name: string) {
		const names = name.split(' ');
		const initials = names.map((n) => n[0]).join('');
		return initials.toUpperCase();
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		{#if $authData.isPending}
			<Sidebar.MenuButton
				size="lg"
				variant="outline"
				aria-disabled="true"
				class="justify-center"
				aria-label={m['account.loading']()}
			>
				<Spinner />
			</Sidebar.MenuButton>
		{:else if !user}
			<Sidebar.MenuButton variant="outline" size="lg" aria-label={m['account.login']()}>
				{#snippet child({ props })}
					<a href={resolve('/login')} {...props}>
						<LogInIcon />
						{m['account.login']()}
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		{:else}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton
							size="lg"
							variant="outline"
							class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							{...props}
						>
							<Avatar.Root class="size-8 rounded-lg">
								<Avatar.Image src={user.image} alt={user.name} />
								<Avatar.Fallback class="rounded-lg">{getInitials(user.name)}</Avatar.Fallback>
							</Avatar.Root>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">{user.name}</span>
								<span class="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDownIcon class="ms-auto size-4" />
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="end"
					sideOffset={4}
				>
					<DropdownMenu.Item>
						<BadgeCheckIcon />
						{m['account.title']()}
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => authClient.signOut()}>
						<LogOutIcon />
						{m['account.logout']()}
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	</Sidebar.MenuItem>
</Sidebar.Menu>
