<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { isExternalLink, sidebarLinks } from './constants';
	import favicon from '$lib/assets/favicon.webp';
	import { m } from '$lib/paraglide/messages';
	import NavUser from './nav-user.svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
	const sidebar = useSidebar();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					class="h-fit w-full justify-start bg-muted text-start"
					onclick={() => sidebar.setOpenMobile(false)}
				>
					<a
						class="flex w-full items-center gap-2 px-2 py-0 text-xl font-semibold"
						href={resolve('/')}
					>
						<img src={favicon} alt="logo" class="h-12 w-12" />
						{m['app.name']()}
					</a>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- We create a Sidebar.Group for each parent. -->
		{#each sidebarLinks as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as link (link.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									onclick={() => sidebar.setOpenMobile(false)}
									isActive={page.url.pathname.startsWith(link.url)}
								>
									{#snippet child({ props })}
										{#if isExternalLink(link.url)}
											<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
											<a href={link.url} target="_blank" rel="noopener noreferrer" {...props}>
												<link.icon />
												<span>{link.title}</span>
											</a>
										{:else}
											<a href={resolve(link.url)} {...props}>
												<link.icon />
												<span>{link.title}</span>
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
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
