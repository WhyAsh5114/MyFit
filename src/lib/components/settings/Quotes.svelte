<script lang="ts">
	import { onMount } from 'svelte';
	import Quote from 'virtual:icons/lucide/quote';
	import type { QuotesDisplayMode } from '@prisma/client';
	import { getRandomQuote, type WorkoutQuote } from '$lib/data/workoutQuotes';

	interface Props {
		class?: string;
		mode: QuotesDisplayMode;
	}

	let currentQuote: WorkoutQuote | null = $state(null);
	let { mode, class: className = '' }: Props = $props();

	function loadRandomQuote() {
		currentQuote = getRandomQuote(mode);
	}

	onMount(() => {
		loadRandomQuote();
	});
</script>

{#if currentQuote}
	<div
		role="region"
		aria-label="Motivational quote"
		class="rounded-lg border border-border bg-secondary/50 p-4 {className}"
	>
		<div class="flex items-start gap-3">
			<div class="mt-1 flex-shrink-0">
				<Quote class="h-5 w-5 text-primary" />
			</div>

			<div class="min-w-0 flex-1">
				<blockquote class="text-base font-medium leading-relaxed text-foreground">
					"{currentQuote.quote}"
				</blockquote>

				<cite class="mt-2 block text-sm font-normal text-muted-foreground">
					— {currentQuote.author}
				</cite>
			</div>
		</div>
	</div>
{/if}
