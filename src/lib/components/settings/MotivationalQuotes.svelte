<script lang="ts">
	import { toast } from 'svelte-sonner';
	import Quote from 'virtual:icons/lucide/quote';
	import * as Card from '$lib/components/ui/card';
	import Loader from 'virtual:icons/lucide/loader';
	import { Switch } from '$lib/components/ui/switch';
	import { Button } from '$lib/components/ui/button';
	import { QuotesDisplayMode } from '@prisma/client';
	import { Checkbox } from '$lib/components/ui/checkbox';

	interface Props {
		quotesEnabled: boolean;
		quotesDisplayModes: QuotesDisplayMode[];
		onUpdateSettings: (enabled: boolean, modes?: QuotesDisplayMode[]) => Promise<void>;
	}

	let { quotesEnabled, quotesDisplayModes, onUpdateSettings }: Props = $props();

	let isUpdating = $state(false);
	let localEnabled = $state(quotesEnabled);
	let localDisplayModes = $state([...quotesDisplayModes]);

	$effect(() => {
		localEnabled = quotesEnabled;
		localDisplayModes = [...quotesDisplayModes];
	});

	const displayModeOptions: { label: string; value: QuotesDisplayMode; description: string }[] = [
		{
			label: 'Pre-Workout',
			value: 'PRE_WORKOUT',
			description: 'Show quotes before starting your workout'
		},
		{
			label: 'Post-Workout',
			value: 'POST_WORKOUT',
			description: 'Show quotes after completing your workout'
		},
		{
			label: 'Between Sets',
			value: 'BETWEEN_SETS',
			description: 'Show quotes during rest periods between sets'
		}
	];

	const toggleQuotes = async (checked: boolean) => {
		if (isUpdating) return;

		isUpdating = true;
		const previousState = localEnabled;
		localEnabled = checked;

		try {
			await onUpdateSettings(checked);
			toast.success(checked ? 'Motivational quotes enabled' : 'Motivational quotes disabled');
		} catch (error) {
			localEnabled = previousState;
			toast.error('Failed to toggle quotes');
			console.error('Failed to toggle quotes:', error);
		} finally {
			isUpdating = false;
		}
	};

	const toggleDisplayMode = async (mode: QuotesDisplayMode, checked: boolean) => {
		if (isUpdating || !localEnabled) return;

		const newModes = checked ? [...localDisplayModes, mode] : localDisplayModes.filter((m) => m !== mode);

		if (newModes.length === 0) {
			toast.error('At least one display mode must be selected');
			return;
		}

		isUpdating = true;
		const previousModes = [...localDisplayModes];
		localDisplayModes = newModes;

		try {
			await onUpdateSettings(localEnabled, newModes);

			const option = displayModeOptions.find((opt) => opt.value === mode);
			const action = checked ? 'enabled' : 'disabled';
			toast.success(`${option?.label} ${action}`);
		} catch (error) {
			localDisplayModes = previousModes;
			console.error('Failed to update display modes:', error);

			if (error instanceof Error && error.message.includes('validation')) {
				toast.error('Invalid display mode selection');
			} else {
				toast.error('Failed to update display modes');
			}
		} finally {
			isUpdating = false;
		}
	};

	const selectAllModes = async () => {
		if (isUpdating || !localEnabled) return;

		const allModes = displayModeOptions.map((opt) => opt.value);
		if (localDisplayModes.length === allModes.length) return;

		isUpdating = true;
		const previousModes = [...localDisplayModes];
		localDisplayModes = allModes;

		try {
			await onUpdateSettings(localEnabled, allModes);
			toast.success('All display modes enabled');
		} catch (error) {
			localDisplayModes = previousModes;
			console.error('Failed to select all modes:', error);
			toast.error('Failed to enable all modes');
		} finally {
			isUpdating = false;
		}
	};

	const clearAllModes = async () => {
		if (isUpdating || !localEnabled || localDisplayModes.length <= 1) return;

		isUpdating = true;
		const previousModes = [...localDisplayModes];
		localDisplayModes = [QuotesDisplayMode.PRE_WORKOUT];

		try {
			await onUpdateSettings(localEnabled, [QuotesDisplayMode.PRE_WORKOUT]);
			toast.success('Reset to Pre-Workout only');
		} catch (error) {
			localDisplayModes = previousModes;
			console.error('Failed to clear modes:', error);
			toast.error('Failed to reset modes');
		} finally {
			isUpdating = false;
		}
	};

	const isAllSelected = $derived(localDisplayModes.length === displayModeOptions.length);
	const selectedCount = $derived(localDisplayModes.length);
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Quote class="h-5 w-5" />
			Motivational Quotes
		</Card.Title>
		<Card.Description>Get inspired with motivational quotes during your workouts</Card.Description>
	</Card.Header>

	<Card.Content class="space-y-6">
		<div class="flex items-center space-x-4 rounded-md border p-4">
			<div class="flex-1 space-y-1">
				<p class="text-sm font-medium leading-none">Enable Motivational Quotes</p>
				<p class="text-xs text-muted-foreground">Display inspirational quotes to keep you motivated</p>
			</div>

			<div class="flex items-center gap-2">
				{#if isUpdating}
					<Loader class="h-4 w-4 animate-spin text-muted-foreground" />
				{/if}
				<Switch name="enable-quotes" checked={localEnabled} onCheckedChange={toggleQuotes} disabled={isUpdating} />
			</div>
		</div>

		{#if localEnabled}
			<div class="animate-in slide-in-from-top-2 space-y-4 duration-300">
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<h4 class="text-sm font-medium">Display Modes</h4>
						<p class="text-xs text-muted-foreground">
							Choose when to show quotes ({selectedCount} selected)
						</p>
					</div>

					<div class="flex gap-2">
						<Button
							size="sm"
							class="text-xs"
							variant="outline"
							onclick={selectAllModes}
							disabled={isUpdating || isAllSelected}
						>
							Select All
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onclick={clearAllModes}
							disabled={isUpdating || selectedCount <= 1}
							class="text-xs"
						>
							Reset
						</Button>
					</div>
				</div>

				<div class="space-y-3">
					{#each displayModeOptions as option}
						{@const isSelected = localDisplayModes.includes(option.value)}
						<div class="flex items-start space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/30">
							<Checkbox
								checked={isSelected}
								id={`mode-${option.value}`}
								onCheckedChange={(checked) => {
									if (typeof checked === 'boolean') {
										toggleDisplayMode(option.value, checked);
									}
								}}
								disabled={isUpdating}
								class="mt-1"
							/>

							<div class="flex-1 space-y-1">
								<label for={`mode-${option.value}`} class="cursor-pointer text-sm font-medium leading-none">
									{option.label}
								</label>
								<p class="text-xs text-muted-foreground">
									{option.description}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
