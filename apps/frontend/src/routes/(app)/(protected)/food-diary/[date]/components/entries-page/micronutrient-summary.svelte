<script lang="ts">
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { ArrowUpIcon, CheckIcon } from '@lucide/svelte';
	import type { MicronutrientRow } from '#lib/domain/nutrition/micronutrients.js';
	import { nutrientLabel } from '#lib/features/food-diary/_common/nutrients.js';
	import { formatNumber } from '#lib/format.js';
	import { m } from '#lib/paraglide/messages.js';
	import { cn } from '#lib/utils.js';

	type Props = { rows: MicronutrientRow[] };
	let { rows }: Props = $props();

	// Small amounts like 2.4 µg of B12 lose their meaning as whole numbers.
	const format = (value: number) => formatNumber(value, value < 10 ? 1 : 0);

	function unit(row: MicronutrientRow) {
		if (row.reference === null) return m['foodDiary.amountUnit']({ unit: row.unit });
		const args = { target: format(row.reference), unit: row.unit };
		// A ceiling's `≤` says it is a limit to stay under, in the width of one character.
		return row.limit === 'ceiling'
			? m['foodDiary.amountOfLimit'](args)
			: m['foodDiary.amountOfTarget'](args);
	}
</script>

<div class="flex w-full flex-col gap-2.5">
	<div class="grid grid-cols-2 gap-x-4 gap-y-2">
		{#each rows as row (row.key)}
			{@const over = row.status.kind === 'off-target'}
			{@const met = row.status.kind === 'on-target'}
			<div class="flex min-w-0 flex-col gap-1">
				<div class="flex items-baseline justify-between gap-1 text-xs">
					<span class="min-w-0 truncate text-muted-foreground">{nutrientLabel(row.key)}</span>
					<span
						class={cn(
							'flex shrink-0 items-center gap-0.5 tabular-nums',
							met && 'font-medium text-success-ink',
							over && 'font-medium text-warning-ink'
						)}
					>
						{#if met}
							<CheckIcon class="size-3" aria-label={m['foodDiary.micronutrientMet']()} />
						{:else if over}
							<ArrowUpIcon class="size-3" aria-label={m['foodDiary.micronutrientOver']()} />
						{/if}
						<span
							>{format(row.amount)}<span class="font-normal text-muted-foreground">{unit(row)}</span
							></span
						>
					</span>
				</div>
				<Progress
					value={row.reference === null ? 0 : Math.min(row.amount, row.reference)}
					max={row.reference || 1}
					class={cn(
						'h-1',
						over
							? '*:data-[slot=progress-indicator]:bg-warning'
							: '*:data-[slot=progress-indicator]:bg-muted-foreground'
					)}
					aria-label={nutrientLabel(row.key)}
				/>
			</div>
		{/each}
	</div>
	<p class="text-[0.6875rem] leading-snug text-muted-foreground">
		{m['foodDiary.micronutrientNote']()}
	</p>
</div>
