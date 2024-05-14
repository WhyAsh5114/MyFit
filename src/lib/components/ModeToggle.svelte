<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Sun from 'virtual:icons/lucide/sun';
	import Moon from 'virtual:icons/lucide/moon';
	import { setMode, resetMode, mode } from 'mode-watcher';
	import { Chart } from 'chart.js';
	import { onMount } from 'svelte';

	type PropsType = { size?: 'icon' | 'lg'; variant?: 'ghost' | 'outline' };
	let { size = 'icon', variant = 'ghost' }: PropsType = $props();

	function updateChartJSColors() {
		const style = getComputedStyle(document.body);
		const foregroundColor = style.getPropertyValue('--foreground').split(' ').join(', ');
		const foregroundMutedColor = style.getPropertyValue('--muted-foreground').split(' ').join(', ');
		Chart.defaults.color = `hsl(${foregroundMutedColor})`;
		Chart.defaults.borderColor = `hsl(0, 0%, ${$mode === 'light' ? '64%' : '16%'})`;
		Chart.defaults.font.weight = 500;
		Chart.defaults.font.family = "'Inter', sans-serif";
	}

	onMount(updateChartJSColors);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} {variant} {size}>
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => setMode('light')}>Light</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('dark')}>Dark</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => resetMode()}>System</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
