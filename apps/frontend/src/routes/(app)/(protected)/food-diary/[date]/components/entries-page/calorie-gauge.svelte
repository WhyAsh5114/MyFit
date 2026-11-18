<script lang="ts">
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { chartMotion, chartTween } from '#lib/components/chart-motion.svelte.js';
	import { Tween } from 'svelte/motion';
	import { untrack } from 'svelte';
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
		/** What was eaten, to split the consumed arc by macro. */
		eaten: Macros;
		status: NutritionStatus;
	};
	let { consumed, target, eaten, status }: Props = $props();

	/** The gauge sweeps 270°, open at the bottom. Angles are in degrees from 12 o'clock. */
	const RANGE: [number, number] = [-135, 135];
	/** Sized for the `size-32` box: room outside the arc for the goal tick and the amber band. */
	const OUTER = 56;
	const THICKNESS = 9;

	let over = $derived(target !== null && consumed > target);
	let flagged = $derived(status.kind === 'off-target');

	// Food labels and their macros rarely add up exactly, so the macros only split the eaten calories.
	let shares = $derived.by(() => {
		const kcal = {
			carbs: eaten.carbsG * KCAL_PER_GRAM.carbs,
			fat: eaten.fatG * KCAL_PER_GRAM.fat,
			protein: eaten.proteinG * KCAL_PER_GRAM.protein
		};
		const total = kcal.carbs + kcal.fat + kcal.protein;
		const share = (part: number) => (total > 0 ? (consumed * part) / total : 0);
		return {
			carbs: share(kcal.carbs),
			fat: share(kcal.fat),
			protein: share(kcal.protein),
			// Food without macros still fills the arc.
			eaten: total > 0 ? 0 : consumed,
			consumed,
			target: target ?? 0
		};
	});

	// layerchart sweeps the pie in once and then jumps to new data, so the gauge tweens its own
	// numbers between values, like the bars beside it. It starts at the first values rather than at
	// zero: the goal tick and the band would otherwise mount at zero and keep that angle.
	const shown = new Tween(untrack(() => shares));
	$effect(() => {
		void shown.set(shares, chartTween.current);
	});

	/** Past the goal, the gauge is scaled to what was eaten. */
	let scale = $derived(Math.max(shown.current.target, shown.current.consumed, 1));

	// Without a goal there is nothing to fill against, so the track stays empty.
	let chartData = $derived.by(() => {
		if (target === null) return [{ key: 'remaining', value: 1, color: 'var(--muted)' }];
		const s = shown.current;
		return [
			{ key: 'carbs', value: s.carbs, color: 'var(--chart-carbs)' },
			{ key: 'fat', value: s.fat, color: 'var(--chart-fat)' },
			{ key: 'protein', value: s.protein, color: 'var(--chart-protein)' },
			{ key: 'eaten', value: s.eaten, color: 'var(--chart-consumed)' },
			{
				key: 'remaining',
				value: Math.max(0, s.target - s.consumed),
				color: 'var(--chart-remaining)'
			}
		].filter((d) => d.value > 0);
	});

	const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
	/** Where `kcal` falls on the gauge, in radians. */
	const angleOf = (kcal: number) => toRadians(RANGE[0] + ((RANGE[1] - RANGE[0]) * kcal) / scale);

	let goalAngle = $derived(angleOf(shown.current.target));
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
				<!-- Checked against the tweened values too, so the band never runs backwards mid-tween. -->
				{#if over && flagged && shown.current.consumed > shown.current.target}
					<!-- An amber band outside the arc marks how far the day went past the goal. -->
					<Arc
						startAngle={goalAngle}
						endAngle={angleOf(shown.current.consumed)}
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
	</div>
</div>
