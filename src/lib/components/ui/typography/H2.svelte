<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '../button';
	import ChartIcon from 'virtual:icons/lucide/bar-chart-big';
	import TextIcon from 'virtual:icons/lucide/text';

	type PropsType = {
		showChartIcon?: boolean;
		chartMode?: boolean;
		children: Snippet;
	};
	let { showChartIcon = false, children, chartMode = $bindable(false) }: PropsType = $props();
</script>

<h2
	class="mb-4 flex h-10 scroll-m-20 items-end justify-between border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
>
	{@render children()}
	{#if showChartIcon}
		<Button onclick={() => (chartMode = !chartMode)} size="icon" variant="outline">
			{#if !chartMode}
				<ChartIcon />
			{:else}
				<TextIcon />
			{/if}
		</Button>
	{/if}
</h2>
