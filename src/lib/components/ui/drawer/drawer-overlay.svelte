<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$lib/utils.js';

	type $$Props = DrawerPrimitive.OverlayProps;

	export let el: $$Props['el'] = undefined;
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<DrawerPrimitive.Overlay
	class={cn('fixed inset-0 z-50 bg-black/80', className)}
	bind:el
	{...$$restProps}
>
	<slot />
</DrawerPrimitive.Overlay>
