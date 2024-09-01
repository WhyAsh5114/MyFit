<script lang="ts">
	import Ellipsis from 'virtual:icons/lucide/ellipsis';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span class={cn('flex h-9 w-9 items-center justify-center', className)} aria-hidden={true} {...$$restProps}>
	<Ellipsis class="h-4 w-4" />
	<span class="sr-only">More pages</span>
</span>
