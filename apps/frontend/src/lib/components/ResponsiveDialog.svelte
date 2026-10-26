<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { Drawer } from 'vaul-svelte';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	let {
		title,
		description,
		open = $bindable(false),
		dismissible = true,
		busy = false,
		closeLabel,
		onclose,
		children
	}: {
		title: string;
		description: string;
		open?: boolean;
		dismissible?: boolean;
		busy?: boolean;
		closeLabel?: string;
		onclose?: () => void;
		children: Snippet;
	} = $props();

	const isMobile = new IsMobile();
	const canDismiss = $derived(dismissible && !busy);
	let closeButton = $state<HTMLButtonElement | null>(null);

	/** Routes Escape, outside clicks, swipes and the close control through the same cancellation. */
	function changeOpen(value: boolean) {
		if (!value && !canDismiss) return;
		open = value;
		if (!value) onclose?.();
	}

	/** Focuses cancellation before destructive actions when the dialog opens. */
	function focusClose(event: Event) {
		if (!closeButton) return;
		event.preventDefault();
		closeButton.focus();
	}
</script>

{#snippet content()}
	<div class="flex flex-col gap-2 text-left">
		<Dialog.Title class="pr-6 text-lg leading-none font-semibold">{title}</Dialog.Title>
		<Dialog.Description class="text-sm text-muted-foreground">{description}</Dialog.Description>
	</div>
	{@render children()}
	{#if dismissible}
		<button
			bind:this={closeButton}
			type="button"
			disabled={busy}
			onclick={() => changeOpen(false)}
			aria-label={closeLabel}
			class="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
		>
			<XIcon class="size-4" />
		</button>
	{/if}
{/snippet}

{#if isMobile.current}
	<Drawer.Root {open} dismissible={canDismiss} onOpenChange={changeOpen} autoFocus>
		<Drawer.Portal>
			<Drawer.Overlay class="fixed inset-0 z-50 bg-black/50" />
			<Drawer.Content
				data-slot="responsive-drawer"
				aria-busy={busy}
				onOpenAutoFocus={focusClose}
				escapeKeydownBehavior={canDismiss ? 'close' : 'ignore'}
				interactOutsideBehavior={canDismiss ? 'close' : 'ignore'}
				class="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col gap-4 overflow-y-auto rounded-t-xl border bg-background p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lg"
			>
				{#if canDismiss}
					<div class="mx-auto mb-2 h-2 w-24 shrink-0 rounded-full bg-muted"></div>
				{/if}
				{@render content()}
			</Drawer.Content>
		</Drawer.Portal>
	</Drawer.Root>
{:else}
	<Dialog.Root {open} onOpenChange={changeOpen}>
		<Dialog.Portal>
			<Dialog.Overlay
				class="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
			/>
			<Dialog.Content
				data-slot="responsive-dialog"
				aria-busy={busy}
				onOpenAutoFocus={focusClose}
				escapeKeydownBehavior={canDismiss ? 'close' : 'ignore'}
				interactOutsideBehavior={canDismiss ? 'close' : 'ignore'}
				class="fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
			>
				{@render content()}
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
{/if}
