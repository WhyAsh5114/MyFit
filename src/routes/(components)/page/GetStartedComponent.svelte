<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import DoneIcon from 'virtual:icons/lucide/circle-check-big';
	import OpenLinkIcon from 'virtual:icons/lucide/square-arrow-out-up-right';

	type PropsType = { entityCounts?: RouterOutputs['users']['getEntityCounts'] };
	let { entityCounts }: PropsType = $props();

	const taskList = $derived([
		{ task: 'Login', completion: entityCounts !== null, link: '/' },
		{
			task: 'Create an exercise split',
			completion: Number(entityCounts?.exerciseSplits) > 0,
			link: '/exercise-splits'
		},
		{ task: 'Create a mesocycle', completion: Number(entityCounts?.mesocycles) > 0, link: '/mesocycles' },
		{ task: 'Start a mesocycle', completion: Number(entityCounts?.startedMesocycles) > 0, link: '/mesocycles' },
		{ task: 'Create workout', completion: Number(entityCounts?.workouts) > 0, link: '/workouts' }
	]);

	const tasksDone = $derived(taskList.filter(({ completion }) => completion).length);
</script>

{#if tasksDone < taskList.length}
	<H3>Get started</H3>
	{#if entityCounts === undefined}
		<Skeleton class="h-[174px] w-full" />
	{:else}
		<Card.Root class="grid p-4 text-sm">
			{#each taskList as { task, completion, link }, idx}
				{@const prevTaskDone = idx === 0 ? true : taskList.at(idx - 1)?.completion}
				<div class="flex h-7 items-center justify-between">
					<span>{task}</span>
					{#if completion}
						<Button class="h-7 w-7 p-1" size="icon" variant="ghost">
							<DoneIcon class="text-primary" />
						</Button>
					{:else if idx !== 0}
						{@const buttonProps = prevTaskDone ? { href: link } : { disabled: true }}
						<Button class="h-7 w-7 p-1" {...buttonProps} size="icon" variant="ghost">
							<OpenLinkIcon />
						</Button>
					{/if}
				</div>
			{/each}
		</Card.Root>
	{/if}
	<br />
{/if}
