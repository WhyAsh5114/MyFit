<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { type Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	type PropsType = {
		title: Snippet;
		description?: Snippet;
		open: boolean;
		dismissible?: boolean;
		triggerButton?: Snippet<[{ props: Record<string, unknown> }]>;
		cancelButton?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	};

	let {
		title,
		description,
		open = $bindable(false),
		dismissible = true,
		triggerButton,
		cancelButton,
		children
	}: PropsType = $props();

	let isDesktop = new MediaQuery('(min-width: 768px)');
</script>

{#if isDesktop.current}
	<Dialog.Root bind:open>
		{#if triggerButton}
			<Dialog.Trigger>
				{#snippet child({ props })}
					{@render triggerButton({ props })}
				{/snippet}
			</Dialog.Trigger>
		{/if}
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{@render title()}</Dialog.Title>
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
		{#if triggerButton}
			<Drawer.Trigger>
				{#snippet child({ props })}
					{@render triggerButton({ props })}
				{/snippet}
			</Drawer.Trigger>
		{/if}
		<Drawer.Content class="h-fit">
			<Drawer.Header>
				<Drawer.Title>{@render title()}</Drawer.Title>
				{#if description}
					<Drawer.Description>
						{@render description()}
					</Drawer.Description>
				{/if}
			</Drawer.Header>
			<div class="mb-4 flex flex-col gap-2 px-4">
				{#if children}
					{@render children()}
				{/if}
			</div>
			{#if cancelButton}
				<Drawer.Footer class="my-0 shrink pt-2">
					<Drawer.Close>
						{#snippet child({ props })}
							{@render cancelButton({ props })}
						{/snippet}
					</Drawer.Close>
				</Drawer.Footer>
			{/if}
		</Drawer.Content>
	</Drawer.Root>
{/if}
