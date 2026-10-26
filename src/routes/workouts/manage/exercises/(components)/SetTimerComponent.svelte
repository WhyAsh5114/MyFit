<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { formatDuration } from '$lib/utils/duration';
	import { onMount } from 'svelte';
	import TimerIcon from 'virtual:icons/lucide/timer';
	import { workoutRunes } from '../../workoutRunes.svelte';

	let lastCompletedSet = $derived(
		workoutRunes.workoutExercises
			?.flatMap((e) => e.sets)
			.filter((s) => s.completed)
			.at(-1)
	);
	let now = $state(Date.now());
	let lastSetCompletedAt = $state<number | null>(null);
	let showAnimation = $state(false);
	let startedAt = $derived(workoutRunes.workoutData?.startedAt);
	let totalDuration = $derived(startedAt ? formatDuration((now - new Date(startedAt).getTime()) / 1000) : '0:00');
	let restDuration = $derived(lastSetCompletedAt === null ? '—' : formatDuration((now - lastSetCompletedAt) / 1000));
	let timerLabel = $derived(
		`Workout timers: ${lastSetCompletedAt === null ? 'no set completed yet' : `${restDuration} since last set`}, ${totalDuration} total`
	);

	$effect(() => {
		lastSetCompletedAt = lastCompletedSet ? Date.now() : null;
		showAnimation = true;
		const timeout = setTimeout(() => {
			showAnimation = false;
		}, 500);
		return () => clearTimeout(timeout);
	});

	onMount(() => {
		/** Recompute from wall time so background throttling does not lose elapsed time. */
		function updateTime() {
			now = Date.now();
		}

		updateTime();
		const interval = setInterval(updateTime, 1000);
		document.addEventListener('visibilitychange', updateTime);
		return () => {
			clearInterval(interval);
			document.removeEventListener('visibilitychange', updateTime);
		};
	});
</script>

<Popover.Root>
	<Popover.Trigger let:builder asChild>
		<Button builders={[builder]} aria-label={timerLabel} size="icon" variant="outline">
			<TimerIcon class={cn({ 'animate-bounce': showAnimation })} />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-56" aria-label={timerLabel}>
		<dl class="grid grid-cols-2 divide-x text-center">
			<div class="flex flex-col pr-3">
				<dt class="order-last text-xs text-muted-foreground">Since set</dt>
				<dd class="font-mono text-lg font-semibold tabular-nums">{restDuration}</dd>
			</div>
			<div class="flex flex-col pl-3">
				<dt class="order-last text-xs text-muted-foreground">Total</dt>
				<dd class="font-mono text-lg tabular-nums text-muted-foreground">{totalDuration}</dd>
			</div>
		</dl>
	</Popover.Content>
</Popover.Root>
