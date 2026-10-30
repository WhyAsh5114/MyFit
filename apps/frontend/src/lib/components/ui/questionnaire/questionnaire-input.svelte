<script lang="ts">
	import { Questionnaire as QuestionnairePrimitive } from '@shadcn-svelte/primitives/questionnaire';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: QuestionnairePrimitive.InputProps = $props();
</script>

<div
	data-slot="questionnaire-input-wrapper"
	class="group/questionnaire-input relative w-full min-w-0"
>
	<QuestionnairePrimitive.Input
		bind:ref
		data-slot="questionnaire-input"
		class={cn(
			'h-9 min-h-11 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 sm:min-h-0 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
			'selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
			className
		)}
		{...restProps}
	/>
</div>
