<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { page } from '$app/state';
	import * as Breadcrumb from '#lib/components/ui/breadcrumb/index.js';
	import { shortDateFormatter } from '#lib/my-utils.js';
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
						label: m['breadcrumb.item'](),
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

<!-- The current page is the last crumb, so keep the end of a long trail in view. -->
<div
	class="-ml-2 no-scrollbar min-w-0 flex-1 scroll-fade-x overflow-x-auto py-3 pl-2"
	{@attach (node) => {
		void page.url.pathname;
		const toEnd = () => (node.scrollLeft = node.scrollWidth);
		toEnd();
		// The text is wider once the web font has loaded.
		void document.fonts.ready.then(toEnd);
	}}
>
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
			<!-- Room after the last crumb, so its tap area clears the sync button. -->
			<li class="w-3 shrink-0" aria-hidden="true"></li>
		</Breadcrumb.List>
	</Breadcrumb.Root>
</div>
