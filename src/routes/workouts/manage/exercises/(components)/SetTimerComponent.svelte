<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import TimerIcon from 'virtual:icons/lucide/timer';
	import MinusIcon from 'virtual:icons/lucide/minus';
	import { workoutRunes } from '../../workoutRunes.svelte';

	let lastCompletedSet = $derived(
		workoutRunes.workoutExercises
			?.flatMap((e) => e.sets)
			.filter((s) => s.completed)
			.at(-1)
	);
	let secondsSinceLastSet = $state(0);
	let showAnimation = $state(false);

	$effect(() => {
		if (lastCompletedSet) secondsSinceLastSet = 0;
		showAnimation = true;
		setTimeout(() => {
			showAnimation = false;
		}, 500);
	});

	setInterval(() => {
		secondsSinceLastSet += 1;
	}, 1000);

	function secondsToMS(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
</script>

<Popover.Root>
	<Popover.Trigger let:builder asChild>
		<Button builders={[builder]} aria-label="time-since-last-set" size="icon" variant="outline">
			<TimerIcon class={cn({ 'animate-bounce': showAnimation })} />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-20 text-center font-semibold">
		{#if lastCompletedSet}
			{secondsToMS(secondsSinceLastSet)}
		{:else}
			<MinusIcon class="mx-auto" />
		{/if}
	</Popover.Content>
</Popover.Root>
