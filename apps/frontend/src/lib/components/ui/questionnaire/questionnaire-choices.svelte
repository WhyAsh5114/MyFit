<script lang="ts">
	import { Questionnaire as QuestionnairePrimitive } from '@shadcn-svelte/primitives/questionnaire';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: QuestionnairePrimitive.ChoicesProps = $props();
</script>

<QuestionnairePrimitive.Choices
	bind:ref
	data-slot="questionnaire-choices"
	class={cn('group/questionnaire-choices grid min-w-0 gap-3', className)}
	{...restProps}
/>
