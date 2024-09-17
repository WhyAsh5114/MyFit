<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import FilterIcon from 'virtual:icons/lucide/filter';
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button class="grow gap-2" aria-label="search" builders={[builder]} variant="secondary">
			Filters <FilterIcon />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="flex w-11/12 max-w-xl flex-col gap-1">No workouts to filter</Popover.Content>
</Popover.Root>
