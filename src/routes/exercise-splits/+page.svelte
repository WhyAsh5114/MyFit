<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Pagination from '$lib/components/ui/pagination';
	import AddIcon from 'virtual:icons/material-symbols/add';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
</script>

<H2>Exercise splits</H2>
<div class="flex grow flex-col gap-2">
	<div class="flex gap-2">
		<Input id="search-exercise-splits" placeholder="Search" />
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]}><AddIcon /></Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<a href="/exercise-splits/new">Start from scratch</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item>Use template</DropdownMenu.Item>
					<DropdownMenu.Item>Clone older split</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="flex h-px grow flex-col overflow-y-auto border"></div>
	<Pagination.Root count={50} perPage={5} siblingCount={0} let:pages let:currentPage>
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton>
					<ChevronLeft class="h-4 w-4" />
					<span class="hidden sm:block">Previous</span>
				</Pagination.PrevButton>
			</Pagination.Item>
			{#each pages as page (page.key)}
				{#if page.type === 'ellipsis'}
					<Pagination.Item>
						<Pagination.Ellipsis />
					</Pagination.Item>
				{:else}
					<Pagination.Item>
						<Pagination.Link {page} isActive={currentPage == page.value}>
							{page.value}
						</Pagination.Link>
					</Pagination.Item>
				{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton>
					<span class="hidden sm:block">Next</span>
					<ChevronRight class="h-4 w-4" />
				</Pagination.NextButton>
			</Pagination.Item>
		</Pagination.Content>
	</Pagination.Root>
</div>
