<script lang="ts">
	import { getLocalTimeZone, parseDate } from '@internationalized/date';
	import { BookOpenIcon, TriangleAlertIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { shortDateFormatter } from '#lib/my-utils.js';
	import { m } from '#lib/paraglide/messages.js';

	type ReadFoodEntriesPart = Extract<
		MyUIMessage['parts'][number],
		{ type: 'tool-readFoodEntries' }
	>;
	const { part }: { part: ReadFoodEntriesPart } = $props();

	/** The days that were asked for, as "Oct 28 – Oct 31", or one day. */
	const range = $derived.by(() => {
		const { from, to } = part.input ?? {};
		if (!from) return '';
		try {
			const timezone = getLocalTimeZone();
			const start = shortDateFormatter.format(parseDate(from).toDate(timezone));
			if (!to || to === from) return start;
			return `${start} – ${shortDateFormatter.format(parseDate(to).toDate(timezone))}`;
		} catch {
			return '';
		}
	});
</script>

<p role="status" class="flex items-center gap-2 text-sm text-muted-foreground">
	{#if part.state === 'output-available'}
		<BookOpenIcon class="size-4" />
		{m['chat.readDiary']({ range })}
	{:else if part.state === 'output-error'}
		<TriangleAlertIcon class="size-4" />
		{m['chat.readDiaryFailed']()}
	{:else}
		<Spinner />
		{m['chat.readingDiary']()}
	{/if}
</p>
