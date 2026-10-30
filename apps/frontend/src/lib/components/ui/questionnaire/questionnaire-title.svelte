<script lang="ts">
	import { Questionnaire as QuestionnairePrimitive } from '@shadcn-svelte/primitives/questionnaire';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: QuestionnairePrimitive.TitleProps = $props();
</script>

<QuestionnairePrimitive.Title
	bind:ref
	data-slot="questionnaire-title"
	class={cn(
		'font-heading text-base font-semibold text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-5',
		className
	)}
	{...restProps}
/>
