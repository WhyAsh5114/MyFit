<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$lib/utils.js';

	type $$Props = DrawerPrimitive.DescriptionProps;

	export let el: $$Props['el'] = undefined;
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<DrawerPrimitive.Description
	class={cn('text-sm text-muted-foreground', className)}
	bind:el
	{...$$restProps}
>
	<slot />
</DrawerPrimitive.Description>
