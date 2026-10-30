<script lang="ts">
	import { Questionnaire as QuestionnairePrimitive } from '@shadcn-svelte/primitives/questionnaire';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		children,
		class: className,
		...restProps
	}: QuestionnairePrimitive.ChoiceProps = $props();
</script>

<QuestionnairePrimitive.Choice
	bind:ref
	data-slot="questionnaire-choice"
	class={cn(
		'group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-3 rounded-4xl border border-input px-4 py-3.5 text-start text-sm transition-colors outline-none select-none hover:bg-input/40 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-[3px] has-[>input:focus-visible]:ring-ring/50 data-invalid:border-destructive data-checked:border-primary/40 data-checked:bg-primary/10',
		'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
		className
	)}
	{...restProps}
>
	<QuestionnairePrimitive.ChoiceInput
		data-slot="questionnaire-choice-input"
		class="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
	/>
	<span
		aria-hidden="true"
		data-slot="questionnaire-choice-indicator"
		class="pointer-events-none relative flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-[6px] border border-input group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground dark:bg-input/30 dark:group-data-checked/questionnaire-choice:bg-primary"
	>
		<span
			data-slot="questionnaire-choice-indicator-dot"
			class="hidden size-2 rounded-full bg-primary-foreground group-data-[type=checkbox]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
		></span>
		<CheckIcon
			data-slot="questionnaire-choice-indicator-check"
			class="hidden size-3.5 group-data-[type=radio]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
		/>
	</span>
	<QuestionnairePrimitive.ChoiceLabel
		data-slot="questionnaire-choice-label"
		class="flex min-w-0 flex-1 flex-col gap-1 leading-snug"
	>
		{@render children?.()}
	</QuestionnairePrimitive.ChoiceLabel>
	<QuestionnairePrimitive.ChoiceShortcut
		data-slot="questionnaire-choice-shortcut"
		class="pointer-events-none ms-auto hidden size-5 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-full border border-input bg-background/80 font-mono text-[0.625rem] leading-none font-medium text-muted-foreground group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[shortcut]/questionnaire-choice:inline-flex"
	/>
</QuestionnairePrimitive.Choice>
