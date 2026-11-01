<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { CirclePlusIcon, SaladIcon, SearchIcon } from '@lucide/svelte';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
</script>

<div class="flex gap-2">
	<InputGroup.Root>
		<InputGroup.Input placeholder={m['foodDiary.recipes.searchPlaceholder']()} />
		<InputGroup.Addon>
			<SearchIcon />
		</InputGroup.Addon>
	</InputGroup.Root>
	<Button href={resolve('food-diary/goals/recipes/new')}
		>{m['foodDiary.recipes.create']()} <CirclePlusIcon /></Button
	>
</div>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<SaladIcon />
		</Empty.Media>
		<Empty.Title>{m['foodDiary.recipes.emptyTitle']()}</Empty.Title>
		<Empty.Description>
			{m['foodDiary.recipes.emptyDescription']()}
		</Empty.Description>
	</Empty.Header>
</Empty.Root>
