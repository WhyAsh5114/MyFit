<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import {
		BookOpenTextIcon,
		CalendarIcon,
		ChartNoAxesCombinedIcon,
		DownloadIcon,
		DumbbellIcon,
		GithubIcon,
		GlobeLockIcon,
		HandCoinsIcon,
		LayoutDashboardIcon,
		NotebookTextIcon,
		PackagePlusIcon,
		RefreshCcwIcon,
		RssIcon
	} from 'lucide-svelte';
	import { appLayoutState } from './app-layout-state.svelte';

	const sidebar = useSidebar();
	const linkGroups = [
		{
			label: 'Application',
			items: [
				{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
				{
					label: 'Progression',
					href: '/progression',
					icon: ChartNoAxesCombinedIcon
				}
			]
		},
		{
			label: 'Items',
			items: [
				{ label: 'Workouts', href: '/workouts', icon: DumbbellIcon },
				{ label: 'Mesocycles', href: '/mesocycles', icon: NotebookTextIcon },
				{
					label: 'Exercise splits',
					href: '/exercise-splits',
					icon: CalendarIcon
				}
			]
		},
		{
			label: 'Resources',
			items: [
				{ label: 'Docs', href: '/docs', icon: BookOpenTextIcon },
				{ label: 'Changelog', href: '/changelog', icon: PackagePlusIcon },
				{ label: 'Blog', href: '/blog', icon: RssIcon }
			]
		},
		{
			label: 'More',
			items: [
				{ label: 'Donations', href: '/donations', icon: HandCoinsIcon },
				{
					label: 'Github',
					href: 'https://github.com/WhyAsh5114/MyFit',
					icon: GithubIcon
				},
				{
					label: 'Privacy policy',
					href: '/privacy-policy',
					icon: GlobeLockIcon
				}
			]
		}
	];
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					class="bg-secondary h-fit w-full justify-start text-start"
					onclick={() => sidebar.setOpenMobile(false)}
				>
					<a class="flex w-full items-center gap-2 px-2 py-0 text-xl font-semibold" href="/">
						<img src="/favicon.ico" alt="logo" class="h-12 w-12" />
						MyFit <span class="ml-auto text-sm font-normal">v4</span>
					</a>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		{#each linkGroups as linkGroup (linkGroup.label)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{linkGroup.label}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each linkGroup.items as link (link.label)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton onclick={() => sidebar.setOpenMobile(false)}>
									{#snippet child({ props })}
										<a href={link.href} {...props}>
											<link.icon />
											<span>{link.label}</span>
										</a>
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
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				{#if appLayoutState.skipWaitingFunction}
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
					<Sidebar.MenuButton
						aria-label="Install app"
						onclick={() => appLayoutState.deferredPrompt?.prompt()}
						variant="outline"
					>
						<DownloadIcon />
						Install
					</Sidebar.MenuButton>
				{/if}
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
