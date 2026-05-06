<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { CirclePlusIcon, SaladIcon, SearchIcon } from '@lucide/svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { resolve } from '$app/paths';
</script>

<div class="flex gap-2">
	<InputGroup.Root>
		<InputGroup.Input placeholder="pesto wrap" />
		<InputGroup.Addon>
			<SearchIcon />
		</InputGroup.Addon>
	</InputGroup.Root>
	<Button href={resolve('/food-diary/goals/recipes/new')}>Create <CirclePlusIcon /></Button>
</div>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<SaladIcon />
		</Empty.Media>
		<Empty.Title>No recipes</Empty.Title>
		<Empty.Description>
			Recipes allow you to group multiple food items together and log them as a single entry.
		</Empty.Description>
	</Empty.Header>
</Empty.Root>
