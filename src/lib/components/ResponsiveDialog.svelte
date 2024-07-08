<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { onMount } from 'svelte';

	export let dismissible = true;
	export let needTrigger = true;
	export let variant:
		| 'outline'
		| 'link'
		| 'default'
		| 'destructive'
		| 'secondary'
		| 'ghost'
		| undefined = 'outline';
	export let size: 'default' | 'sm' | 'lg' | 'icon' | undefined = 'default';
	export let ariaLabel = '';
	export let cancelVariant:
		| 'outline'
		| 'link'
		| 'default'
		| 'destructive'
		| 'secondary'
		| 'ghost'
		| undefined = 'outline';
	export let title: string;
	export let description: string | undefined = undefined;
	export let open = false;

	let isDesktop = false;
	onMount(() => {
		isDesktop = window.matchMedia('(min-width: 768px)').matches;
	});
</script>

{#if isDesktop}
	<Dialog.Root bind:open>
		{#if needTrigger}
			<Dialog.Trigger asChild let:builder>
				<Button aria-label={ariaLabel} builders={[builder]} {size} {variant}>
					<slot name="buttonContent" />
				</Button>
			</Dialog.Trigger>
		{/if}
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{title}</Dialog.Title>
				{#if description}
					<Dialog.Description>
						{description}
					</Dialog.Description>
				{/if}
			</Dialog.Header>
			<slot />
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root {dismissible} bind:open>
		{#if needTrigger}
			<Drawer.Trigger asChild let:builder>
				<Button aria-label={ariaLabel} builders={[builder]} {size} {variant}>
					<slot name="buttonContent" />
				</Button>
			</Drawer.Trigger>
		{/if}
		<Drawer.Content class="h-fit">
			<Drawer.Header>
				<Drawer.Title>{title}</Drawer.Title>
				{#if description}
					<Drawer.Description>
						{description}
					</Drawer.Description>
				{/if}
			</Drawer.Header>
			<div class="flex flex-col gap-2 px-4">
				<slot />
			</div>
			<Drawer.Footer class="my-0 shrink pt-2">
				<Drawer.Close asChild let:builder>
					<Button builders={[builder]} variant={cancelVariant}>Cancel</Button>
				</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}
