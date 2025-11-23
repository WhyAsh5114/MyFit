<script lang="ts">
	import { goto } from '$app/navigation';
	import CircularProgressBar from '$lib/components/magicui/circular-progress-bar.svelte';
	import H1 from '$lib/components/typography/h1.svelte';
	import H3 from '$lib/components/typography/h3.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { GETTING_STARTED_QUESTIONS } from '$lib/constants';
	import { client } from '$lib/idb-client';
	import { kebabToCamel } from '$lib/my-utils';
	import {
		CheckCircleIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		LoaderCircleIcon,
		XCircleIcon
	} from '@lucide/svelte';
	import type { FitnessKnowledge, MyFitPrimaryUsage } from '$lib/generated/prisma/client';
	import { createMutation } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { Spring } from 'svelte/motion';

	const questions = GETTING_STARTED_QUESTIONS;

	let currentQuestion = $state(0);
	let slideAnimation = $state('slide-in-from-right');
	let progressValue = new Spring(0, { stiffness: 0.3, damping: 0.9 });
	let answers = $state<string[]>(questions.map((q) => q.default));

	$effect(() => {
		progressValue.set(currentQuestion);
	});

	const saveAnswersMutation = createMutation(() => ({
		mutationFn: async () => {
			const user = await client.user.findFirstOrThrow();
			const data = {
				userId: user.id,
				fitnessKnowledge: kebabToCamel(answers[0]) as FitnessKnowledge,
				myFitPrimaryUsage: kebabToCamel(answers[1]) as MyFitPrimaryUsage
			};
			await client.gettingStartedAnswers.upsert({
				where: { userId: user.id },
				update: data,
				create: data
			});
			toast.success('Your preferences have been saved!');
			goto('/dashboard');
		},
		onError: (error) => {
			toast.error('An error occurred while saving your preferences', {
				description: error.message
			});
			console.error('Error saving answers:', error);
		}
	}));
</script>

<H1 class="flex items-center justify-between">
	Getting started
	{#key progressValue.current}
		<CircularProgressBar
			class="text-background size-10"
			max={questions.length}
			min={0}
			value={progressValue.current}
			gaugePrimaryColor="hsl(var(--primary))"
			gaugeSecondaryColor="hsl(var(--muted))"
		/>
	{/key}
</H1>

{#key currentQuestion}
	<H3 class="animate-in {slideAnimation}">{questions[currentQuestion].question}</H3>
	<RadioGroup.Root
		value={questions[currentQuestion].default}
		onValueChange={(v) => (answers[currentQuestion] = v)}
		class="grid gap-2"
	>
		{#each questions[currentQuestion].options as { value, label, description, Icon } (value)}
			<Card.Root class="border-0 py-0">
				<Label
					for={value}
					class="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary animate-in {slideAnimation} flex items-center gap-4 rounded-lg border-2 p-4"
				>
					<RadioGroup.Item {value} id={value} class="sr-only" aria-label={label} />
					<Icon size={36} class="shrink-0" />
					<div class="flex flex-col gap-2">
						<Card.Title>{label}</Card.Title>
						<Card.Description class="text-muted-foreground leading-tight">
							{description}
						</Card.Description>
					</div>
				</Label>
			</Card.Root>
		{/each}
	</RadioGroup.Root>
{/key}

<div class="mt-auto grid grid-cols-2 items-end gap-2">
	{#if currentQuestion === 0}
		<Button variant="secondary" href="/dashboard"><XCircleIcon /> Skip</Button>
	{:else}
		<Button
			variant="secondary"
			onclick={() => {
				slideAnimation = 'slide-in-from-left';
				currentQuestion--;
			}}
		>
			<ChevronLeftIcon /> Previous
		</Button>
	{/if}
	{#if currentQuestion < questions.length - 1}
		<Button
			onclick={() => {
				slideAnimation = 'slide-in-from-right';
				currentQuestion++;
			}}
		>
			Next <ChevronRightIcon />
		</Button>
	{:else}
		<Button disabled={saveAnswersMutation.isPending} onclick={() => saveAnswersMutation.mutate()}>
			{#if saveAnswersMutation.isPending}
				<LoaderCircleIcon class="animate-spin" />
			{:else}
				Finish <CheckCircleIcon />
			{/if}
		</Button>
	{/if}
</div>
