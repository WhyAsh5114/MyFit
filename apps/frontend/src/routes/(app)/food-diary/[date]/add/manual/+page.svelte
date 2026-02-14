<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import EntryForm from '../components/entry-form.svelte';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';

	const getCurrentUserQuery = useGetCurrentUserQuery();
</script>

{#if !getCurrentUserQuery.data}
	<Skeleton class="h-70 w-full" />
	<Skeleton class="h-65 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else}
	<EntryForm userId={getCurrentUserQuery.data.id} />
{/if}
