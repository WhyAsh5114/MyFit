<script lang="ts">
	import { cn } from '$lib/utils';

	let { children, class: className = '' } = $props();
</script>

<h2
	class={cn(
		'border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 md:text-3xl',
		className
	)}
>
	{@render children()}
</h2>
