<script lang="ts">
	import { cn } from '$lib/utils';

	let { children, class: className = '' } = $props();
</script>

<h1 class={cn('text-3xl font-extrabold md:text-4xl', className)}>{@render children()}</h1>
