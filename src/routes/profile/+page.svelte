<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { page } from '$app/stores';
</script>

<H2>Profile</H2>

<div class="flex flex-col gap-4">
	<div class="flex flex-col">
		<span class="text-sm text-muted-foreground">Email</span>
		<span>{$page.data.session?.user?.email}</span>
	</div>

	<div class="flex flex-col">
		<span class="text-sm text-muted-foreground">Username</span>
		<span>{$page.data.session?.user?.name}</span>
	</div>
</div>
