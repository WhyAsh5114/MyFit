<script lang="ts">
	import * as Popover from './ui/popover';
	import InfoIcon from 'virtual:icons/lucide/info';

	type PropsType = { ariaLabel: string; text: string; triggerClasses?: string };
	let { ariaLabel, text, triggerClasses = '' }: PropsType = $props();
</script>

<Popover.Root>
	<Popover.Trigger aria-label={ariaLabel} class={triggerClasses}>
		<InfoIcon class="h-4 w-4 text-muted-foreground" />
	</Popover.Trigger>
	<Popover.Content class="w-56 text-sm text-muted-foreground" align="end">
		{text}
	</Popover.Content>
</Popover.Root>
