<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import DOMPurify from 'dompurify';
	import { marked } from 'marked';

	let { data } = $props();
</script>

<H2>Changelog</H2>
{#each data.releases as { body }, idx}
	<article class="prose prose-sm dark:prose-invert md:prose-base">
		{#await marked.parse(body) then body}
			{@html DOMPurify.sanitize(body)}
		{/await}
	</article>
	{#if idx !== data.releases.length - 1}
		<Separator class="my-6" />
	{/if}
{/each}
