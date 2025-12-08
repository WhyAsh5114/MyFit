<script lang="ts">
	import ResponsiveDialog from '$lib/components/responsive-dialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { nutrimentLabels } from '$lib/templates/food';
	import { FilterIcon, SlidersHorizontalIcon } from '@lucide/svelte';

	let { quantity }: { quantity: number } = $props();
	let open = $state(false);
</script>

<ResponsiveDialog bind:open>
	{#snippet title()}
		Extra nutritional values
	{/snippet}
	{#snippet description()}
		per {isNaN(quantity) ? '?' : quantity} grams
	{/snippet}
	{#snippet triggerButton({ props })}
		<Button variant="secondary" {...props}>
			<SlidersHorizontalIcon />
			Extras
		</Button>
	{/snippet}
	<Label class="flex flex-col items-start gap-1.5">
		Search
		<div class="flex w-full items-center gap-2">
			<Input type="text" placeholder="Type here" class="grow" />
			<Button size="icon" variant="secondary"><FilterIcon /></Button>
		</div>
	</Label>
	<ScrollArea class="bg-card h-64 rounded-md border">
		<div class="grid grid-cols-2 gap-4 p-4">
			{#each nutrimentLabels as nutrimentLabel (nutrimentLabel)}
				<div class="flex w-full flex-col gap-1.5">
					<Label for={`food-${nutrimentLabel.toLowerCase()}`}>{nutrimentLabel}</Label>
					<Input
						id={`food-${nutrimentLabel.toLowerCase()}`}
						type="number"
						placeholder="0"
						min={0}
						step={0.01}
					/>
				</div>
			{/each}
		</div>
	</ScrollArea>
	<Button>Done</Button>
</ResponsiveDialog>
