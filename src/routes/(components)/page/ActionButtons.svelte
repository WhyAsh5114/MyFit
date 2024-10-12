<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { onMount } from 'svelte';
	import GitHub from 'virtual:icons/lucide/github';
	import Star from 'virtual:icons/lucide/star';
	import LoginProviderMenu from '../layout/LoginProviderMenu.svelte';

	let stars: number | undefined = $state();

	onMount(async () => {
		const response = await fetch('https://api.github.com/repos/WhyAsh5114/MyFit');
		const body = await response.json();
		stars = body.stargazers_count;
	});
</script>

<div class="mx-auto flex gap-1">
	<Button class="gap-2" variant="secondary" href="https://github.com/WhyAsh5114/MyFit">
		<GitHub />
		GitHub
		{#if stars === undefined}
			<Skeleton class="badge-skeleton !w-14" />
		{:else}
			<Badge class="w-14 gap-1 border border-primary" variant="outline">
				{stars}
				<Star />
			</Badge>
		{/if}
	</Button>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button builders={[builder]} class="w-fit">Login</Button>
		</DropdownMenu.Trigger>
		<LoginProviderMenu />
	</DropdownMenu.Root>
</div>
