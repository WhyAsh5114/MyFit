<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import H3 from '$lib/components/typography/h3.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { QUICK_SETUP_QUESTION } from '$lib/constants';
	import { ChevronRightIcon, XCircleIcon } from '@lucide/svelte';

	let answer = $state<string>(QUICK_SETUP_QUESTION.default);
</script>

<H1 class="flex items-center justify-between">Quickstart</H1>

<H3>{QUICK_SETUP_QUESTION.question}</H3>
<RadioGroup.Root
	value={QUICK_SETUP_QUESTION.default}
	onValueChange={(v) => (answer = v)}
	class="grid gap-2"
>
	{#each QUICK_SETUP_QUESTION.options as { value, label, description, Icon } (value)}
		<Label
			for={value}
			class="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex items-center gap-4 rounded-md border-2 p-4"
		>
			<RadioGroup.Item {value} id={value} class="sr-only" aria-label={label} />
			<Icon size={36} class="shrink-0" />
			<div class="flex flex-col gap-2">
				<p class="font-semibold">{label}</p>
				<p class="text-muted-foreground leading-tight">{description}</p>
			</div>
		</Label>
	{/each}
</RadioGroup.Root>

<div class="mt-auto grid grid-cols-2 items-end gap-2">
	<Button variant="secondary" href="/dashboard"><XCircleIcon /> Cancel</Button>
	<Button href="/quickstart/{answer}">
		Next <ChevronRightIcon />
	</Button>
</div>
