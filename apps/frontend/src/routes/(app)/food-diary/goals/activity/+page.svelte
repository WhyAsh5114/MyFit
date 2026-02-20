<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { cn } from '$lib/utils';
	import { ActivityAdjustmentType } from '@myfit/api/enums';
	import Button from '$lib/components/ui/button/button.svelte';
	import { SaveIcon } from '@lucide/svelte';
	import DynamicActivity from './dynamic-activity.svelte';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useActivityPreferences } from '$lib/features/food-diary/activity-preferences/queries/get';
	import { useSaveActivityPreferences } from '$lib/features/food-diary/activity-preferences/mutations/save';

	const activityAdjustmentMetadata = {
		Static: {
			description: 'Add a fixed amount every day',
			badge: { text: 'flat', variant: 'outline' }
		},
		Dynamic: {
			description: 'Sync activity data from your device',
			badge: { text: 'automatic', variant: 'default' }
		},
		Manual: {
			description: 'No activity calories added automatically'
		}
	} as Record<
		keyof typeof ActivityAdjustmentType,
		{ description: string; badge?: { text: string; variant: 'outline' | 'default' } }
	>;

	const currentUser = useCurrentUser();
	const activityPreferences = useActivityPreferences(
		() => currentUser.data?.id ?? ''
	);
	const saveActivityPreferences = useSaveActivityPreferences();

	let selectedOption = $derived<keyof typeof ActivityAdjustmentType>(
		activityPreferences.data?.adjustmentType ?? 'Manual'
	);
	let staticCalories = $derived<number | undefined>(
		activityPreferences.data?.staticCalories ?? undefined
	);

	let dynamicDataStatus = $state<'unavailable' | 'granted' | 'denied'>();

	let isSaveButtonDisabled = $derived.by(() => {
		if (selectedOption === 'Static') {
			return !staticCalories || staticCalories <= 0;
		}
		if (selectedOption === 'Dynamic') {
			return dynamicDataStatus !== 'granted';
		}
		return saveActivityPreferences.isPending;
	});

	async function saveSettings() {
		if (!currentUser.data) return;

		if (selectedOption === 'Manual') {
			await saveActivityPreferences.mutateAsync({
				adjustmentType: 'Manual',
				userId: currentUser.data.id
			});
		} else if (selectedOption === 'Static') {
			await saveActivityPreferences.mutateAsync({
				adjustmentType: 'Static',
				staticCalories: staticCalories,
				userId: currentUser.data.id
			});
		} else if (selectedOption === 'Dynamic') {
			await saveActivityPreferences.mutateAsync({
				adjustmentType: 'Dynamic',
				userId: currentUser.data.id
			});
		}

		toast.success('Activity calorie preferences saved');
		await goto(resolve('/food-diary/goals'));
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Activity calories</Card.Title>
		<Card.Description>How should activity be added to your daily calorie budget?</Card.Description>
	</Card.Header>
	<Card.Content>
		<RadioGroup.Root bind:value={selectedOption} class="gap-2">
			{#each Object.values(ActivityAdjustmentType) as option (option)}
				<Label
					for={option}
					class="flex items-start rounded-lg border bg-secondary/50 p-3 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/10"
				>
					<RadioGroup.Item value={option} id={option} class="mt-0.5 bg-card!" />
					<div class="flex flex-col items-start gap-1">
						<p>
							{option}
							{#if activityAdjustmentMetadata[option].badge}
								<Badge
									variant={activityAdjustmentMetadata[option].badge.variant}
									class={cn('ml-2 h-5', {
										'bg-card': activityAdjustmentMetadata[option].badge.variant === 'outline'
									})}
								>
									{activityAdjustmentMetadata[option].badge.text}
								</Badge>
							{/if}
						</p>
						<p class="text-xs font-normal text-muted-foreground">
							{activityAdjustmentMetadata[option].description}
						</p>
					</div>
				</Label>
			{/each}
		</RadioGroup.Root>
		<div class="mt-4 flex flex-col gap-2 rounded-lg border bg-secondary/50 p-3">
			{#if selectedOption === 'Manual'}
				<p class="text-xs text-muted-foreground">
					Your calorie budget stays fixed each day. You can log individual exercises on the diary
					page if you want to account for them.
				</p>
			{:else if selectedOption === 'Static'}
				<InputGroup.Root>
					<InputGroup.Input
						placeholder="daily cals"
						type="number"
						bind:value={staticCalories}
						min={0}
					/>
					<InputGroup.Addon align="inline-end">
						<InputGroup.Button>kcal / day</InputGroup.Button>
					</InputGroup.Addon>
				</InputGroup.Root>
				<p class="text-xs text-muted-foreground">
					Added to your budget every day regardless of actual activity.
				</p>
			{:else if selectedOption === 'Dynamic'}
				<DynamicActivity bind:data={dynamicDataStatus} />
			{/if}
		</div>
	</Card.Content>
</Card.Root>

<Button class="mt-auto" disabled={isSaveButtonDisabled} onclick={saveSettings}>
	{#if saveActivityPreferences.isPending}
		<Spinner />
	{:else}
		Save <SaveIcon />
	{/if}
</Button>
