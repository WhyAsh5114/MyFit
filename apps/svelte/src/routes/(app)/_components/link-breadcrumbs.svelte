<script lang="ts">
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Scrollbar } from '$lib/components/ui/scroll-area';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import type { StepRoutesMap } from '$root/scripts/create-routes';
	import { ChevronDown, Slash } from '@lucide/svelte';

	const stepRoutesMap: StepRoutesMap = page.data.stepRoutesMap || {};

	type Item = {
		label: string;
		href?: string;
		isStepBased?: boolean;
		stepItems?: Array<{ label: string; href: string }>;
		parentPath?: string;
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

			const isStepBased = /^\d+-/.test(part);
			const parentPath = `/${parts.slice(0, index).join('/')}`;
			const hasStepRoutes = stepRoutesMap[fullPath] && stepRoutesMap[fullPath].length > 0;

			if (isStepBased && index > 0) {
				let parentItem = items.find((item) => item.href === parentPath);
				if (!parentItem) {
					parentItem = {
						label: parts[index - 1],
						href: parentPath,
						isStepBased: true,
						stepItems: []
					};
					items.push(parentItem);
				}
				parentItem.stepItems = stepRoutesMap[parentPath] || [];
				items.push({ label, href: fullPath });
			} else if (hasStepRoutes) {
				items.push({
					label,
					href: fullPath,
					isStepBased: true,
					stepItems: stepRoutesMap[fullPath]
				});
			} else {
				items.push({ label, href: fullPath });
			}
		});

		return items;
	}

	let items = $derived(pathnameToItems(page.url.pathname));
</script>

<ScrollArea class="w-px grow py-1.5">
	<Breadcrumb.Root>
		<Breadcrumb.List class="flex-nowrap">
			{#each items as item, idx (item.label)}
				<Breadcrumb.Item class="whitespace-nowrap">
					{#if item.isStepBased && item.stepItems && item.stepItems.length > 0}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class="flex items-center gap-1">
								{item.label}
								<ChevronDown class="size-4" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start">
								{#each item.stepItems as stepItem (stepItem.href)}
									<DropdownMenu.Item>
										{#snippet child({ props })}
											<a href={stepItem.href} {...props}>
												<span class="font-mono">{stepItem.label.slice(0, 3)}</span>
												{stepItem.label.slice(2)}
											</a>
										{/snippet}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{:else}
						<Breadcrumb.Link href={item.href}>
							{#if items[idx - 1] && items[idx - 1].isStepBased}
								{#if idx === items.length - 1}
									<span>
										{item.label.charAt(2).toUpperCase() + item.label.slice(3)}
									</span>
								{:else}
									{item.label}
								{/if}
							{:else}
								{item.label}
							{/if}
						</Breadcrumb.Link>
					{/if}
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
