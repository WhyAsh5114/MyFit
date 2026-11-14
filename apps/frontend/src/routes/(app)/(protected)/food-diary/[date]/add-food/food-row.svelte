<script lang="ts">
	import * as Item from '#lib/components/ui/item/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { PlusIcon } from '@lucide/svelte';

	type Props = {
		name: string;
		detail: string;
		/** The food's page, to change the amount before logging. */
		href: string;
		/** The + button: a link, or an action that logs the food straight away. */
		action: { label: string; href: string } | { label: string; onclick: () => void };
		pending?: boolean;
		disabled?: boolean;
	};
	let { name, detail, href, action, pending = false, disabled = false }: Props = $props();
</script>

<!-- The link and the button are siblings: a button inside a link would also navigate. -->
<Item.Root class="flex-nowrap gap-2 bg-card py-1.5 pe-1.5 shadow-sm">
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers pass a resolved href -->
	<a {href} class="flex min-h-11 w-px grow flex-col justify-center gap-0.5">
		<Item.Title class="block! w-full! min-w-0 truncate">{name}</Item.Title>
		<Item.Description class="tabular-nums">{detail}</Item.Description>
	</a>
	<Item.Actions class="shrink-0">
		{#if 'href' in action}
			<Button
				size="icon"
				href={action.href}
				aria-label={action.label}
				class="rounded-full"
				variant="outline"
			>
				<PlusIcon />
			</Button>
		{:else}
			<Button
				size="icon"
				onclick={action.onclick}
				disabled={disabled || pending}
				aria-label={action.label}
				class="rounded-full"
				variant="outline"
			>
				{#if pending}<Spinner />{:else}<PlusIcon />{/if}
			</Button>
		{/if}
	</Item.Actions>
</Item.Root>
