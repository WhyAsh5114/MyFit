<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { page } from '$app/stores';
	import { exerciseSplitStore } from './exerciseSplitStore';

	const mode = $page.params.mode;
</script>

<H3>
	{#if mode === 'new'}
		Starting from scratch
	{:else}
		Editing <span class="font-bold">{$exerciseSplitStore.name}</span>
	{/if}
</H3>

{#if true}
	<Button class="mt-auto">
		<a href="/exercise-splits/{mode}/structure" class="w-full">
			{#if mode === 'new'}
				Create new split
			{:else}
				Edit split
			{/if}
		</a>
	</Button>
{:else}
	<div class="mt-auto grid grid-cols-2 gap-2">
		<Button variant="destructive">Overwrite changes</Button>
		<Button>Continue editing</Button>
	</div>
{/if}
