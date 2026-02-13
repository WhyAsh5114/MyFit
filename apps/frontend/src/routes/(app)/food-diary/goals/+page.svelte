<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { RulerIcon, FlameIcon, TargetIcon, ChevronRightIcon } from '@lucide/svelte';
	import { m } from '$lib/paraglide/messages';

	const buttonData = [
		{
			title: m['foodDiary.metricsTitle'](),
			description: m['foodDiary.metricsDescription'](),
			href: '/food-diary/goals/metrics',
			icon: RulerIcon
		},
		{
			title: m['foodDiary.activityTitle'](),
			description: m['foodDiary.activityDescription'](),
			href: '/food-diary/goals/activity',
			icon: FlameIcon
		},
		{
			title: m['foodDiary.targetsTitle'](),
			description: m['foodDiary.targetsDescription'](),
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
