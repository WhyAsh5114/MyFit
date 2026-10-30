<script lang="ts">
	import { MessageScroller as MessageScrollerPrimitive } from '@shadcn-svelte/primitives/message-scroller';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: MessageScrollerPrimitive.ContentProps = $props();
</script>

<MessageScrollerPrimitive.Content
	bind:ref
	data-slot="message-scroller-content"
	class={cn('flex h-max min-h-full flex-col gap-8', className)}
	{...restProps}
/>
