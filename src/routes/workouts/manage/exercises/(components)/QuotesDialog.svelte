<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { getRandomQuote, type WorkoutQuote } from '$lib/data/workoutQuotes';
	import { quoteFrequencyRunes } from '$lib/stores/quoteFrequencyRunes.svelte';
	import * as Separator from '$lib/components/ui/separator';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Slider } from '$lib/components/ui/slider';
	import { Input } from '$lib/components/ui/input';
	import SettingsIcon from 'virtual:icons/lucide/settings';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	type PropsType = { completedSets: number };
	let { completedSets }: PropsType = $props();

	let maxCompletedSets = $state(completedSets);
	let open = $state(false);
	let currentQuote = $state<WorkoutQuote>(null!);
	let showSettings = $state(false);

	onMount(() => {
		quoteFrequencyRunes.loadFromLocalStorage();
	});

	$effect(() => {
		if (completedSets > maxCompletedSets) {
			maxCompletedSets = completedSets;

			// Use the new frequency logic
			if (quoteFrequencyRunes.shouldShowQuote(completedSets)) {
				currentQuote = getRandomQuote('BETWEEN_SETS');
				open = true;
			}
		}
	});

	function updateFrequencyType(type: string) {
		if (type === 'random' || type === 'every_x_sets') {
			quoteFrequencyRunes.updateSettings({ type });
		}
	}

	function updateRandomChance(value: number[]) {
		quoteFrequencyRunes.updateSettings({ randomChance: value[0] });
	}

	function updateEveryXSets(value: number) {
		if (value > 0) {
			quoteFrequencyRunes.updateSettings({ everyXSets: value });
		}
	}
</script>

<ResponsiveDialog title="Motivational quote" bind:open>
	{#snippet description()}
		<Button variant="ghost" size="sm" class="gap-2 px-0" onclick={() => (showSettings = !showSettings)}>
			Frequency Settings
			<SettingsIcon class="h-4 w-4" />
		</Button>
	{/snippet}

	<div class="space-y-4">
		<!-- Quote Section -->
		<blockquote>
			<p>{currentQuote?.quote}</p>
			<footer>
				<cite class="italic text-muted-foreground">
					- {currentQuote?.author}
				</cite>
			</footer>
		</blockquote>

		{#if showSettings}
			<Separator.Root />

			<!-- Settings Section -->
			<div class="space-y-4">
				<div class="space-y-3">
					<Label class="text-sm font-medium">Quote frequency</Label>
					<RadioGroup.Root
						value={quoteFrequencyRunes.settings.type}
						onValueChange={updateFrequencyType}
						class="space-y-2"
					>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="every_x_sets" id="every-x-sets" />
							<Label for="every-x-sets" class="text-sm">Every X sets</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="random" id="random" />
							<Label for="random" class="text-sm">Random chance after each set</Label>
						</div>
					</RadioGroup.Root>
				</div>

				{#if quoteFrequencyRunes.settings.type === 'every_x_sets'}
					<div class="space-y-2">
						<Label for="every-x-input" class="text-sm">Show quote every</Label>
						<div class="flex items-center space-x-2">
							<Input
								id="every-x-input"
								type="number"
								min="1"
								max="20"
								value={quoteFrequencyRunes.settings.everyXSets}
								onchange={(e) => updateEveryXSets(e.currentTarget.valueAsNumber)}
								class="w-20"
							/>
							<span class="text-sm text-muted-foreground">sets</span>
						</div>
					</div>
				{:else}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label class="text-sm">Chance per set</Label>
							<span class="text-sm text-muted-foreground">{quoteFrequencyRunes.settings.randomChance}%</span>
						</div>
						<Slider
							value={[quoteFrequencyRunes.settings.randomChance]}
							onValueChange={updateRandomChance}
							max={100}
							min={1}
							step={1}
							class="w-full"
						/>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</ResponsiveDialog>
