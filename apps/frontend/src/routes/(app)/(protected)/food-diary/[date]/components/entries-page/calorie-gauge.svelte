<script lang="ts">
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { chartMotion } from '#lib/components/chart-motion.svelte.js';
	import { Arc, PieChart } from 'layerchart';
	import { m } from '#lib/paraglide/messages.js';
	import { formatNumber } from '#lib/format.js';
	import { cn } from '#lib/utils.js';
	import type { Macros } from '#lib/domain/nutrition/portion.js';
	import { KCAL_PER_GRAM } from '#lib/domain/nutrition/constants.js';
	import type { NutritionStatus } from '#lib/domain/nutrition/status.js';
	import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from '@lucide/svelte';

	type Props = {
		consumed: number;
		/** The day's allowance, including what was burned; null without a calorie goal. */
		target: number | null;
		burned: number;
		/** What was eaten, to split the consumed arc by macro. */
		eaten: Macros;
		status: NutritionStatus;
	};
	let { consumed, target, burned, eaten, status }: Props = $props();

	/** The gauge sweeps 270°, open at the bottom. Angles are in degrees from 12 o'clock. */
	const RANGE: [number, number] = [-135, 135];
	/** Sized for the `size-32` box: room outside the arc for the goal tick and the amber band. */
	const OUTER = 56;
	const THICKNESS = 9;

	let over = $derived(target !== null && consumed > target);
	let flagged = $derived(status.kind === 'off-target');
	/** Past the goal, the gauge is scaled to what was eaten. */
	let scale = $derived(Math.max(target ?? 0, consumed, 1));

	// Without a goal there is nothing to fill against, so the track stays empty.
	// Food labels and their macros rarely add up exactly, so the macros only split the eaten calories.
	let chartData = $derived.by(() => {
		if (target === null) return [{ key: 'remaining', value: 1, color: 'var(--muted)' }];
		const shares = [
			{ key: 'carbs', kcal: eaten.carbsG * KCAL_PER_GRAM.carbs, color: 'var(--chart-carbs)' },
			{ key: 'fat', kcal: eaten.fatG * KCAL_PER_GRAM.fat, color: 'var(--chart-fat)' },
			{
				key: 'protein',
				kcal: eaten.proteinG * KCAL_PER_GRAM.protein,
				color: 'var(--chart-protein)'
			}
		];
		const macroKcal = shares.reduce((sum, s) => sum + s.kcal, 0);
		const eatenArcs =
			macroKcal > 0
				? shares.map((s) => ({ ...s, value: (consumed * s.kcal) / macroKcal }))
				: [{ key: 'eaten', value: consumed, color: 'var(--chart-consumed)' }];
		return [
			...eatenArcs,
			{
				key: 'remaining',
				value: Math.max(0, target - consumed),
				color: 'var(--chart-remaining)'
			}
		].filter((d) => d.value > 0);
	});

	const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
	/** Where `kcal` falls on the gauge, in radians. */
	const angleOf = (kcal: number) => toRadians(RANGE[0] + ((RANGE[1] - RANGE[0]) * kcal) / scale);

	let goalAngle = $derived(angleOf(Math.max(target ?? 0, 0)));
</script>

<!-- The bars beside it say the same, so the chart is decorative. -->
<div class="relative size-32 shrink-0">
	<Chart.Container config={{}} class="size-full" aria-hidden="true">
		<PieChart
			data={chartData}
			key="key"
			value="value"
			c="color"
			range={RANGE}
			outerRadius={OUTER}
			innerRadius={-THICKNESS}
			padAngle={0.02}
			padding={0}
			tooltipContext={false}
			props={{ pie: { motion: chartMotion.current, sort: null } }}
		>
			{#snippet aboveMarks()}
				{#if over && flagged}
					<!-- An amber band outside the arc marks how far the day went past the goal. -->
					<Arc
						startAngle={goalAngle}
						endAngle={angleOf(consumed)}
						innerRadius={OUTER + 2}
						outerRadius={OUTER + 5}
						cornerRadius={1.5}
						class="fill-warning"
					/>
				{/if}
				{#if target !== null && target > 0}
					<!-- The goal. -->
					<Arc
						startAngle={goalAngle - 0.02}
						endAngle={goalAngle + 0.02}
						innerRadius={OUTER - THICKNESS - 3}
						outerRadius={OUTER + 3}
						class="fill-foreground"
					/>
				{/if}
			{/snippet}
		</PieChart>
	</Chart.Container>

	<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
		<p class="text-2xl leading-none font-semibold tracking-tight tabular-nums">
			{formatNumber(target === null ? consumed : Math.abs(target - consumed))}
		</p>
		<p
			class={cn(
				'mt-1 flex items-center gap-0.5 text-xs',
				flagged && 'font-medium text-warning-ink',
				status.kind === 'on-target' && 'font-medium text-success-ink',
				status.kind === 'neutral' && 'text-muted-foreground'
			)}
		>
			{#if status.kind === 'on-target'}
				<CheckIcon class="size-3" />
			{:else if status.kind === 'off-target'}
				{#if status.direction === 'over'}
					<ArrowUpIcon class="size-3" />
				{:else}
					<ArrowDownIcon class="size-3" />
				{/if}
			{/if}
			{target === null
				? m['foodDiary.gaugeEaten']()
				: over
					? m['foodDiary.gaugeOver']()
					: m['foodDiary.gaugeLeft']()}
		</p>
		<!-- Inside the dial, so a day with activity is the same height as one without. -->
		{#if target !== null && burned > 0}
			<p class="mt-0.5 text-[0.625rem] text-muted-foreground tabular-nums">
				{m['foodDiary.burnedShort']({ amount: formatNumber(burned) })}
			</p>
		{/if}
	</div>
</div>
