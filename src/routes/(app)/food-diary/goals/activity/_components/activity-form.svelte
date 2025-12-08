<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { defaults, superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import type { SuperFormData } from 'sveltekit-superforms/client';
	import {
		macroTrackingActivitySchema,
		type MacroTrackingActivitySchema
	} from './activity-form-schema';
	import DynamicActivity from './dynamic-activity.svelte';
	import ManualActivity from './manual-activity.svelte';
	import StaticActivity from './static-activity.svelte';

	type PropsType = {
		onUpdate?: (event: { form: SuperValidated<MacroTrackingActivitySchema> }) => unknown;
		formData: SuperFormData<MacroTrackingActivitySchema>;
	};
	let { onUpdate, formData = $bindable() }: PropsType = $props();

	const form = superForm(defaults(zod4(macroTrackingActivitySchema)), {
		SPA: true,
		validators: zod4(macroTrackingActivitySchema),
		resetForm: false,
		onUpdate: (event) => onUpdate?.(event)
	});

	let { enhance } = form;
	({ form: formData } = form);
</script>

<form id="activity-form" use:enhance>
	<Tabs.Root bind:value={$formData.adjustmentType}>
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="Dynamic">Dynamic</Tabs.Trigger>
			<Tabs.Trigger value="Manual">Manual</Tabs.Trigger>
			<Tabs.Trigger value="Static">Static</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="Dynamic">
			<DynamicActivity />
		</Tabs.Content>
		<Tabs.Content value="Manual">
			<ManualActivity />
		</Tabs.Content>
		<Tabs.Content value="Static">
			<StaticActivity bind:caloricValue={$formData.staticCalories} />
		</Tabs.Content>
	</Tabs.Root>
</form>
