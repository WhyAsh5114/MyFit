<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { RulerIcon, FlameIcon, TargetIcon, ChevronRightIcon } from '@lucide/svelte';

	const buttonData = [
		{
			title: 'Metrics',
			description: 'Your bodyweight, height, and other metrics',
			href: '/food-diary/goals/metrics',
			icon: RulerIcon
		},
		{
			title: 'Activity',
			description: 'Daily energy expenditure and activity tracking',
			href: '/food-diary/goals/activity',
			icon: FlameIcon
		},
		{
			title: 'Targets',
			description: 'Set your targets: weight change and macro ratios',
			href: '/food-diary/goals/targets',
			icon: TargetIcon
		}
	] as const;
</script>

{#each buttonData as entry (entry.title)}
	<a href={resolve(entry.href)}>
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<entry.icon class="size-4" />
					{entry.title}
				</Card.Title>
				<Card.Description>{entry.description}</Card.Description>
				<Card.Action>
					<Button size="icon" class="rounded-full" variant="secondary">
						<ChevronRightIcon />
					</Button>
				</Card.Action>
			</Card.Header>
		</Card.Root>
	</a>
{/each}
