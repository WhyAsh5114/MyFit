<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { useSidebar } from '#lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { isExternalLink, sidebarLinks } from './constants.js';
	import favicon from '#lib/assets/favicon.webp';
	import { m } from '#lib/paraglide/messages.js';
	import NavUser from './nav-user.svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
	const sidebar = useSidebar();
	// The open phone sidebar is a history entry. A link in it takes that entry's place, which also
	// closes the sidebar, so Back from the new page returns here with it closed.
	// SvelteKit reads `data-sveltekit-replacestate` as "" (on) or "false"; any other value warns.
	const replaceState = $derived.by(() => {
		if (sidebar.openMobile) return '';
		return 'false';
	});
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header class="pt-[calc(env(safe-area-inset-top)+0.5rem)]">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="h-fit w-full justify-start bg-card text-start">
					<a
						class="flex w-full items-center gap-2 px-2 py-0 text-xl font-semibold"
						href={resolve('/')}
						data-sveltekit-replacestate={replaceState}
					>
						<!-- Decorative: the app name follows it in the same link. -->
						<img src={favicon} alt="" class="h-12 w-12" />
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
								<Sidebar.MenuButton isActive={page.url.pathname.startsWith(`/${link.url}`)}>
									{#snippet child({ props })}
										{#if isExternalLink(link.url)}
											<!-- An external site: `resolve` is for routes of this app. -->
											<!-- eslint-disable svelte/no-navigation-without-resolve -->
											<a
												href={link.url}
												target="_blank"
												rel="noopener noreferrer"
												{...props}
												onclick={() => sidebar.setOpenMobile(false)}
											>
												<link.icon />
												<span>{link.title}</span>
											</a>
											<!-- eslint-enable svelte/no-navigation-without-resolve -->
										{:else}
											<a
												href={resolve(link.url)}
												{...props}
												data-sveltekit-replacestate={replaceState}
											>
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
	<Sidebar.Footer class="pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
