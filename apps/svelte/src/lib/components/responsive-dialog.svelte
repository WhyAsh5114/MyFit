<script lang="ts">
	import { Button, type ButtonSize, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { onMount, type Snippet } from 'svelte';

	type PropsType = {
		title: string;
		description?: Snippet;
		open: boolean;
		dismissible?: boolean;
		triggerButtonVariant?: ButtonVariant;
		triggerButtonSize?: ButtonSize;
		triggerButtonAriaLabel?: string;
		triggerButtonContent?: Snippet;
		cancelButtonVariant?: ButtonVariant;
		children?: Snippet;
	};

	let {
		title,
		description,
		open = $bindable(false),
		dismissible = true,
		triggerButtonVariant = 'outline',
		triggerButtonSize = 'default',
		triggerButtonAriaLabel = '',
		triggerButtonContent,
		cancelButtonVariant = 'outline',
		children
	}: PropsType = $props();

	let isDesktop = $state(false);
	onMount(() => (isDesktop = window.matchMedia('(min-width: 768px)').matches));
</script>

{#if isDesktop}
	<Dialog.Root bind:open>
		{#if triggerButtonContent}
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						aria-label={triggerButtonAriaLabel}
						size={triggerButtonSize}
						variant={triggerButtonVariant}
					>
						{@render triggerButtonContent()}
					</Button>
				{/snippet}
			</Dialog.Trigger>
		{/if}
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{title}</Dialog.Title>
				{#if description}
					<Dialog.Description>
						{@render description()}
					</Dialog.Description>
				{/if}
			</Dialog.Header>
			{#if children}
				{@render children()}
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root {dismissible} bind:open>
		{#if triggerButtonContent}
			<Drawer.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						aria-label={triggerButtonAriaLabel}
						size={triggerButtonSize}
						variant={triggerButtonVariant}
					>
						{@render triggerButtonContent()}
					</Button>
				{/snippet}
			</Drawer.Trigger>
		{/if}
		<Drawer.Content class="h-fit">
			<Drawer.Header>
				<Drawer.Title>{title}</Drawer.Title>
				{#if description}
					<Drawer.Description>
						{@render description()}
					</Drawer.Description>
				{/if}
			</Drawer.Header>
			<div class="flex flex-col gap-2 px-4">
				{#if children}
					{@render children()}
				{/if}
			</div>
			<Drawer.Footer class="my-0 shrink pt-2">
				<Drawer.Close>
					{#snippet child({ props })}
						<Button {...props} variant={cancelButtonVariant}>Cancel</Button>
					{/snippet}
				</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}
