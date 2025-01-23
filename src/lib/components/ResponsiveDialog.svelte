<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { onMount, type Snippet } from 'svelte';

	type PropsType = {
		title: string;
		description?: Snippet;
		open: boolean;
		dismissible?: boolean;
		triggerButtonVariant?: Button['$$prop_def']['variant'];
		triggerButtonSize?: Button['$$prop_def']['size'];
		triggerButtonAriaLabel?: string;
		triggerButtonContent?: Snippet;
		cancelButtonVariant?: Button['$$prop_def']['variant'];
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
			<Dialog.Trigger asChild let:builder>
				<Button
					aria-label={triggerButtonAriaLabel}
					builders={[builder]}
					size={triggerButtonSize}
					variant={triggerButtonVariant}
				>
					{@render triggerButtonContent()}
				</Button>
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
			<Drawer.Trigger asChild let:builder>
				<Button
					aria-label={triggerButtonAriaLabel}
					builders={[builder]}
					size={triggerButtonSize}
					variant={triggerButtonVariant}
				>
					{@render triggerButtonContent()}
				</Button>
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
				<Drawer.Close asChild let:builder>
					<Button builders={[builder]} variant={cancelButtonVariant}>Cancel</Button>
				</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}
