<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { exerciseSplitStore } from './exerciseSplitStore';

	const mode = $page.params.mode;
	const cloning = $page.url.searchParams.has('clone');
	const usingTemplate = $page.url.searchParams.has('template');
</script>

<H3>
	{#if mode === 'new'}
		{#if cloning}
			Cloning <span class="font-bold">{$exerciseSplitStore.name}</span>
		{:else if usingTemplate}
			Templating <span class="font-bold">{$exerciseSplitStore.name}</span>
		{:else}
			Starting from scratch
		{/if}
	{:else}
		Editing <span class="font-bold">{$exerciseSplitStore.name}</span>
	{/if}
</H3>

<Button class="mt-auto">
	<a href="/exercise-splits/{mode}/structure" class="w-full">
		{#if mode === 'new'}
			Create new split
		{:else}
			Edit split
		{/if}
	</a>
</Button>
