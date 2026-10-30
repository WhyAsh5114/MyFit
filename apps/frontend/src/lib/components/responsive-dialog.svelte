<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as Drawer from '#lib/components/ui/drawer/index.js';
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	let {
		title,
		description,
		dismissible = true,
		closeLabel,
		onclose,
		children,
		footer
	}: {
		title: string;
		/** Plain text, or a snippet when the description needs markup such as a shimmer. */
		description: string | Snippet;
		/** Whether Escape, an outside click, a swipe or the close button may close it. */
		dismissible?: boolean;
		closeLabel?: string;
		/** Called when the user dismisses it. */
		onclose?: () => void;
		children?: Snippet;
		/** The actions. The first focusable one gets focus, so put the safe action first. */
		footer?: Snippet;
	} = $props();

	const isDesktop = new MediaQuery('(min-width: 768px)');
	let open = $state(true);

	function changeOpen(value: boolean) {
		if (value || !dismissible) return;
		open = false;
		onclose?.();
	}
</script>

{#snippet text()}
	{#if typeof description === 'string'}
		{description}
	{:else}
		{@render description()}
	{/if}
{/snippet}

{#if isDesktop.current}
	<Dialog.Root bind:open={() => open, changeOpen}>
		<Dialog.Content showCloseButton={dismissible} {closeLabel}>
			<Dialog.Header>
				<Dialog.Title>{title}</Dialog.Title>
				<Dialog.Description>{@render text()}</Dialog.Description>
			</Dialog.Header>
			{@render children?.()}
			{#if footer}
				<Dialog.Footer>{@render footer()}</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open={() => open, changeOpen} {dismissible} autoFocus>
		<Drawer.Content>
			<Drawer.Header class="text-start">
				<Drawer.Title>{title}</Drawer.Title>
				<Drawer.Description>{@render text()}</Drawer.Description>
			</Drawer.Header>
			{#if children}
				<div class="px-4">{@render children()}</div>
			{/if}
			{#if footer}
				<Drawer.Footer>{@render footer()}</Drawer.Footer>
			{/if}
		</Drawer.Content>
	</Drawer.Root>
{/if}
