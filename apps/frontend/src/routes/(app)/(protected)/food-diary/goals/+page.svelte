<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '#lib/components/ui/card/index.js';
	import {
		RulerIcon,
		FlameIcon,
		TargetIcon,
		ChevronRightIcon,
		SaladIcon,
		ClockIcon
	} from '@lucide/svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { cn } from '#lib/utils.js';
	import { recentChange } from '#lib/features/food-diary/_common/recent-change.svelte.js';

	const buttonData = [
		{
			title: m['foodDiary.metricsTitle'](),
			description: m['foodDiary.metricsDescription'](),
			href: 'food-diary/goals/metrics',
			id: 'metrics',
			icon: RulerIcon
		},
		{
			title: m['foodDiary.activityTitle'](),
			description: m['foodDiary.activityDescription'](),
			href: 'food-diary/goals/activity',
			id: 'activity',
			icon: FlameIcon
		},
		{
			title: m['foodDiary.targetsTitle'](),
			description: m['foodDiary.targetsDescription'](),
			href: 'food-diary/goals/targets',
			id: 'targets',
			icon: TargetIcon
		},
		{
			title: m['foodDiary.mealsTitle'](),
			description: m['foodDiary.mealsDescription'](),
			href: 'food-diary/goals/meals',
			id: 'meals',
			icon: ClockIcon
		},
		{
			title: m['foodDiary.recipesTitle'](),
			description: m['foodDiary.recipesDescription'](),
			href: 'food-diary/goals/recipes',
			id: 'recipes',
			icon: SaladIcon
		}
	] as const;
</script>

{#each buttonData as entry (entry.title)}
	<a href={resolve(entry.href)}>
		<Card.Root class={cn({ 'animate-highlight': recentChange.id === entry.id })}>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<entry.icon class="size-4" />
					{entry.title}
				</Card.Title>
				<Card.Description>{entry.description}</Card.Description>
				<Card.Action>
					<span
						class="grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground"
					>
						<ChevronRightIcon class="size-4" />
					</span>
				</Card.Action>
			</Card.Header>
		</Card.Root>
	</a>
{/each}
