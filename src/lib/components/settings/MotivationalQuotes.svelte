<script lang="ts">
	import { toast } from 'svelte-sonner';
	import Quote from 'virtual:icons/lucide/quote';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Loader from 'virtual:icons/lucide/loader';
	import { Switch } from '$lib/components/ui/switch';
	import { QuotesDisplayMode } from '@prisma/client';
	import * as Select from '$lib/components/ui/select';

	interface Props {
		quotesEnabled: boolean;
		quotesDisplayMode: QuotesDisplayMode;
		onUpdateSettings: (enabled: boolean, mode?: QuotesDisplayMode) => Promise<void>;
	}

	let { quotesEnabled, quotesDisplayMode, onUpdateSettings }: Props = $props();

	let isUpdating = $state(false);
	let localEnabled = $state(quotesEnabled);
	let localDisplayMode = $state(quotesDisplayMode);

	$effect(() => {
		localEnabled = quotesEnabled;
		localDisplayMode = quotesDisplayMode;
	});

	const displayModeOptions = [
		{
			label: 'Pre-Workout',
			value: QuotesDisplayMode.PRE_WORKOUT,
			description: 'Show quotes before starting your workout'
		},
		{
			label: 'Post-Workout',
			value: QuotesDisplayMode.POST_WORKOUT,
			description: 'Show quotes after completing your workout'
		},
		{
			label: 'Between Sets',
			value: QuotesDisplayMode.BETWEEN_SETS,
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

	const updateDisplayMode = async (newMode: QuotesDisplayMode) => {
		if (isUpdating || !localEnabled) return;

		isUpdating = true;
		const previousMode = localDisplayMode;
		localDisplayMode = newMode;

		try {
			await onUpdateSettings(localEnabled, newMode);

			const option = displayModeOptions.find((opt) => opt.value === newMode);
			toast.success(`Display mode changed to ${option?.label}`);
		} catch (error) {
			localDisplayMode = previousMode;
			console.error('Failed to update display mode:', error);

			if (error instanceof Error && error.message.includes('validation')) {
				toast.error('Invalid display mode selected');
			} else {
				toast.error('Failed to update display mode');
			}
		} finally {
			isUpdating = false;
		}
	};

	const selectedDisplayMode = $derived(displayModeOptions.find((opt) => opt.value === localDisplayMode));
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
			<div class="animate-in slide-in-from-top-2 space-y-3 duration-300">
				<h4 class="text-sm font-medium">Display Mode</h4>

				<Select.Root
					disabled={isUpdating}
					selected={{ value: localDisplayMode, label: selectedDisplayMode?.label || '' }}
					onSelectedChange={(selected) => {
						if (selected?.value && !isUpdating) {
							updateDisplayMode(selected.value);
						}
					}}
				>
					<Select.Trigger class="w-full">
						{#if selectedDisplayMode}
							<span class="font-medium"
								>{selectedDisplayMode.label}

								<span class="text-xs text-muted-foreground"> ({selectedDisplayMode.description})</span>
							</span>
						{:else}
							<span class="text-muted-foreground">Select when to show quotes</span>
						{/if}
					</Select.Trigger>

					<Select.Content>
						<Select.Group>
							{#each displayModeOptions as option}
								<Select.Item value={option.value} class="space-y-1">
									<div class="flex flex-col items-start">
										<span class="font-medium">{option.label}</span>
										<span class="text-xs text-muted-foreground">
											{option.description}
										</span>
									</div>
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
