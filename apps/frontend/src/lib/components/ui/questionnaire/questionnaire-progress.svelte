<script lang="ts">
	import { Questionnaire as QuestionnairePrimitive } from '@shadcn-svelte/primitives/questionnaire';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: QuestionnairePrimitive.ProgressProps = $props();
</script>

<QuestionnairePrimitive.Progress
	bind:ref
	data-slot="questionnaire-progress"
	class={cn(
		'min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums',
		className
	)}
	{...restProps}
/>
