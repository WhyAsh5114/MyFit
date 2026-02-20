<script lang="ts">
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Scrollbar } from '$lib/components/ui/scroll-area';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { shortDateFormatter } from '$lib/my-utils';
	import { getLocalTimeZone, parseDate } from '@internationalized/date';
	import { Slash } from '@lucide/svelte';
	import z from 'zod';

	type Item = {
		label: string;
		href?: string;
	};

	function pathnameToItems(pathname: string): Item[] {
		const parts = pathname.split('/').filter((part) => part !== '');

		return pathname
			.split('/')
			.filter((part) => part !== '')
			.map((part, index) => {
				const fullPath = `/${parts.slice(0, index + 1).join('/')}`;
				let label;

				try {
					const date = parseDate(part);
					return {
						label: shortDateFormatter.format(date.toDate(getLocalTimeZone())),
						href: fullPath
					};
				} catch {
					// Not a date, continue processing
				}

				try {
					z.uuid().parse(part);
					return {
						label: 'Item',
						href: fullPath
					};
				} catch {
					// Not a UUID, continue processing
				}

				label = part
					.split('-')
					.map((word, idx) => (idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
					.join(' ');

				return { label, href: fullPath };
			});
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
