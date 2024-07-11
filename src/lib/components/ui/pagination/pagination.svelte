<script lang="ts">
	import { Pagination as PaginationPrimitive } from 'bits-ui';

	import { cn } from '$lib/utils.js';

	type $$Props = PaginationPrimitive.Props;
	type $$Events = PaginationPrimitive.Events;

	let className: $$Props['class'] = undefined;
	export let count: $$Props['count'] = 0;
	export let perPage: $$Props['perPage'] = 10;
	export let page: $$Props['page'] = 1;
	export let siblingCount: $$Props['siblingCount'] = 1;
	export { className as class };

	$: currentPage = page;
</script>

<PaginationPrimitive.Root
	asChild
	{count}
	{perPage}
	{siblingCount}
	bind:page
	let:builder
	let:pages
	let:range
	{...$$restProps}
>
	<nav {...builder} class={cn('mx-auto flex w-full flex-col items-center', className)}>
		<slot {currentPage} {pages} {range} />
	</nav>
</PaginationPrimitive.Root>
