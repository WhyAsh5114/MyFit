<script lang="ts">
	import { markRecentChange } from '#lib/features/food-diary/_common/recent-change.svelte.js';
	import Badge from '#lib/components/ui/badge/badge.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import * as RadioGroup from '#lib/components/ui/radio-group/index.js';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { cn } from '#lib/utils.js';
	import type { Row } from '@myfit/shared/client';
	import { enums } from '#lib/clients/idb-client.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import { SaveIcon } from '@lucide/svelte';
	import DynamicActivity from './dynamic-activity.svelte';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useCreateActivityPreferences } from '#lib/features/food-diary/activity-preferences/mutations/create.js';
	import type { PageProps } from './$types';
	import { m } from '#lib/paraglide/messages.js';

	let { data }: PageProps = $props();

	type ActivityAdjustmentType = Row<'ActivityPreferences'>['adjustmentType'];

	/** Labels are read inside a function so they follow the current locale. */
	const activityAdjustmentMetadata: Record<
		ActivityAdjustmentType,
		() => {
			label: string;
			description: string;
			badge?: { text: string; variant: 'outline' | 'default' };
		}
	> = {
		Static: () => ({
			label: m['foodDiary.activityGoal.static'](),
			description: m['foodDiary.activityGoal.staticDescription'](),
			badge: { text: m['foodDiary.activityGoal.staticBadge'](), variant: 'outline' }
		}),
		Dynamic: () => ({
			label: m['foodDiary.activityGoal.dynamic'](),
			description: m['foodDiary.activityGoal.dynamicDescription'](),
			badge: { text: m['foodDiary.activityGoal.dynamicBadge'](), variant: 'default' }
		}),
		Manual: () => ({
			label: m['foodDiary.activityGoal.manual'](),
			description: m['foodDiary.activityGoal.manualDescription']()
		})
	};

	const createActivityPreferences = useCreateActivityPreferences();

	let selectedOption = $derived<ActivityAdjustmentType>(
		data.preferences?.adjustmentType ?? 'Manual'
	);
	let staticCalories = $derived<number | undefined>(data.preferences?.staticCalories ?? undefined);

	let dynamicDataStatus = $state<'unavailable' | 'granted' | 'denied'>();

	let isSaveButtonDisabled = $derived.by(() => {
		if (selectedOption === 'Static') {
			return !staticCalories || staticCalories <= 0;
		}
		if (selectedOption === 'Dynamic') {
			return dynamicDataStatus !== 'granted';
		}
		return createActivityPreferences.isPending;
	});

	/** Persists the selected activity adjustment and returns to the goals page. */
	async function saveSettings() {
		const userId = data.ownerId;

		if (selectedOption === 'Manual') {
			await createActivityPreferences.mutateAsync({
				adjustmentType: 'Manual',
				staticCalories: null,
				userId
			});
		} else if (selectedOption === 'Static') {
			await createActivityPreferences.mutateAsync({
				adjustmentType: 'Static',
				staticCalories: staticCalories ?? null,
				userId
			});
		} else if (selectedOption === 'Dynamic') {
			await createActivityPreferences.mutateAsync({
				adjustmentType: 'Dynamic',
				staticCalories: null,
				userId
			});
		}

		markRecentChange('activity');
		await goto(resolve('food-diary/goals'));
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['foodDiary.activityGoal.title']()}</Card.Title>
		<Card.Description>{m['foodDiary.activityGoal.description']()}</Card.Description>
	</Card.Header>
	<Card.Content>
		<RadioGroup.Root bind:value={selectedOption} class="gap-2">
			{#each enums.__unbound__.ActivityAdjustmentType.values as option (option)}
				{@const meta = activityAdjustmentMetadata[option]()}
				<Label
					for={option}
					class="flex items-start rounded-lg border bg-secondary/50 p-3 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/10"
				>
					<RadioGroup.Item value={option} id={option} class="mt-0.5 bg-card!" />
					<div class="flex flex-col items-start gap-1">
						<p>
							{meta.label}
							{#if meta.badge}
								<Badge
									variant={meta.badge.variant}
									class={cn('ml-2 h-5', { 'bg-card': meta.badge.variant === 'outline' })}
								>
									{meta.badge.text}
								</Badge>
							{/if}
						</p>
						<p class="text-xs font-normal text-muted-foreground">
							{meta.description}
						</p>
					</div>
				</Label>
			{/each}
		</RadioGroup.Root>
		<div class="mt-4 flex flex-col gap-2 rounded-lg border bg-secondary/50 p-3">
			{#if selectedOption === 'Manual'}
				<p class="text-xs text-muted-foreground">
					{m['foodDiary.activityGoal.manualNote']()}
				</p>
			{:else if selectedOption === 'Static'}
				<InputGroup.Root>
					<InputGroup.Input
						placeholder={m['foodDiary.activityGoal.staticPlaceholder']()}
						type="number"
						bind:value={staticCalories}
						min={0}
					/>
					<InputGroup.Addon align="inline-end">
						<InputGroup.Button>{m['foodDiary.activityGoal.staticUnit']()}</InputGroup.Button>
					</InputGroup.Addon>
				</InputGroup.Root>
				<p class="text-xs text-muted-foreground">
					{m['foodDiary.activityGoal.staticNote']()}
				</p>
			{:else if selectedOption === 'Dynamic'}
				<DynamicActivity bind:data={dynamicDataStatus} />
			{/if}
		</div>
	</Card.Content>
</Card.Root>

<Button class="mt-auto" disabled={isSaveButtonDisabled} onclick={saveSettings}>
	{#if createActivityPreferences.isPending}
		<Spinner />
	{:else}
		{m['foodDiary.metrics.save']()} <SaveIcon />
	{/if}
</Button>
