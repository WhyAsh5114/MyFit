<script lang="ts">
	import { cn } from '$lib/utils';

	let { children, class: className = '' } = $props();
</script>

<h3 class={cn('text-xl font-semibold tracking-tight md:text-2xl', className)}>
	{@render children()}
</h3>
