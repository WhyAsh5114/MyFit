<script lang="ts">
	import { GlobeIcon, TriangleAlertIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import * as Collapsible from '#lib/components/ui/collapsible/index.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { m } from '#lib/paraglide/messages.js';

	type WebSearchPart = Extract<MyUIMessage['parts'][number], { type: 'tool-webSearch' }>;
	const { part }: { part: WebSearchPart } = $props();

	const query = $derived(part.input?.query ?? '');

	/** A source's site, which says more at a glance than its full address. */
	function host(url: string) {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return url;
		}
	}
</script>

{#if part.state === 'output-available'}
	<!-- The sources stay one tap away, so the user can check where a number came from. -->
	<Collapsible.Root class="max-w-full min-w-0">
		<Collapsible.Trigger
			class="-my-2.5 flex min-h-11 w-full min-w-0 items-center gap-2 text-start text-sm text-muted-foreground"
		>
			<GlobeIcon class="size-4 shrink-0" />
			<span class="min-w-0 truncate">
				{m['chat.searchedWeb']({ query, count: part.output.results.length })}
			</span>
		</Collapsible.Trigger>
		<Collapsible.Content>
			<ul class="flex flex-col gap-1 border-s ps-3 text-sm">
				{#each part.output.results as result (result.url)}
					<li>
						<!-- An external source, not an app route. -->
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={result.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex min-h-11 flex-col justify-center underline-offset-4 hover:underline"
						>
							<span class="line-clamp-1">{result.title}</span>
							<span class="text-xs text-muted-foreground">{host(result.url)}</span>
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</li>
				{/each}
			</ul>
		</Collapsible.Content>
	</Collapsible.Root>
{:else if part.state === 'output-error'}
	<p role="status" class="flex max-w-full min-w-0 items-center gap-2 text-sm text-muted-foreground">
		<TriangleAlertIcon class="size-4 shrink-0" />
		{m['chat.searchWebFailed']()}
	</p>
{:else}
	<p role="status" class="flex max-w-full min-w-0 items-center gap-2 text-sm text-muted-foreground">
		<Spinner />
		<span class="min-w-0 truncate">{m['chat.searchingWeb']({ query })}</span>
	</p>
{/if}
