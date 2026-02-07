<script lang="ts">
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Scrollbar } from '$lib/components/ui/scroll-area';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { Slash } from '@lucide/svelte';

	type Item = {
		label: string;
		href?: string;
	};

	function pathnameToItems(pathname: string): Item[] {
		const parts = pathname.split('/').filter((part) => part !== '');
		const items: Item[] = [];

		parts.forEach((part, index) => {
			const fullPath = `/${parts.slice(0, index + 1).join('/')}`;
			const label = part
				.split('-')
				.map((word, idx) => (idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
				.join(' ');

			items.push({ label, href: fullPath });
		});

		if (items.length === 0) {
			items.push({ label: 'All notifications', href: '/' });
		}
		return items;
	}

	let items = $derived(pathnameToItems(page.url.pathname));
</script>

<ScrollArea class="w-px grow py-1.5">
	<Breadcrumb.Root>
		<Breadcrumb.List class="flex-nowrap">
			{#each items as item, idx (item.label)}
				<Breadcrumb.Item class="whitespace-nowrap">
					<Breadcrumb.Link href={item.href}>
						{item.label}
					</Breadcrumb.Link>
				</Breadcrumb.Item>
				{#if idx !== items.length - 1}
					<Breadcrumb.Separator>
						<Slash />
					</Breadcrumb.Separator>
				{/if}
			{/each}
		</Breadcrumb.List>
	</Breadcrumb.Root>
	<Scrollbar orientation="horizontal" />
</ScrollArea>
