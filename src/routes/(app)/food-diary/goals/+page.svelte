<script>
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import { FlameIcon, RulerIcon, TargetIcon } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card';

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
	];
</script>

<H1>Food diary</H1>
<H2>Goals</H2>

{#each buttonData as data (data.title)}
	<a href={data.href}>
		<Card.Root class="py-4">
			<Card.Header class="px-4">
				<Card.Title class="flex gap-2">
					<svelte:component this={data.icon} size={16} />
					{data.title}
				</Card.Title>
				<Card.Description>{data.description}</Card.Description>
			</Card.Header>
		</Card.Root>
	</a>
{/each}
