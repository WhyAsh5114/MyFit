<script lang="ts">
	import { cn } from '#lib/utils.js';
	import DOMPurify from 'isomorphic-dompurify';
	import { marked } from 'marked';

	let {
		text,
		muted = false,
		class: className
	}: { text: string; muted?: boolean; class?: string } = $props();

	// Parsed synchronously, so a streaming reply updates in place instead of blinking out
	// while an async render is pending.
	const html = $derived(DOMPurify.sanitize(marked.parse(text, { async: false })));
</script>

<article class:muted class={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</article>

<style>
	/* Typography's default text is a muted gray; a reply should read in the normal text colour. */
	article {
		--tw-prose-body: var(--foreground);
		--tw-prose-headings: var(--foreground);
		--tw-prose-bold: var(--foreground);
		--tw-prose-links: var(--foreground);
		--tw-prose-code: var(--foreground);
		--tw-prose-quotes: var(--foreground);
		--tw-prose-bullets: var(--muted-foreground);
		--tw-prose-counters: var(--muted-foreground);
		--tw-prose-hr: var(--border);
		--tw-prose-invert-body: var(--foreground);
		--tw-prose-invert-headings: var(--foreground);
		--tw-prose-invert-bold: var(--foreground);
		--tw-prose-invert-links: var(--foreground);
		--tw-prose-invert-code: var(--foreground);
		--tw-prose-invert-quotes: var(--foreground);
		--tw-prose-invert-bullets: var(--muted-foreground);
		--tw-prose-invert-counters: var(--muted-foreground);
		--tw-prose-invert-hr: var(--border);
	}

	/* Reasoning reads as a quieter aside to the reply. */
	article.muted {
		--tw-prose-body: var(--muted-foreground);
		--tw-prose-invert-body: var(--muted-foreground);
		--tw-prose-bold: var(--muted-foreground);
		--tw-prose-invert-bold: var(--muted-foreground);
	}
</style>
