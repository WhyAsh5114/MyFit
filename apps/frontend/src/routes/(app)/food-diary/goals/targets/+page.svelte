<script lang="ts">
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import MacroTargetsForm from './macro-targets-form.svelte';
	import { useGetMacroTargetsQuery } from '$lib/features/food-diary/macro-targets/get-macro-targets';

	const getCurrentUserQuery = useGetCurrentUserQuery();
	const getMacroTargetsQuery = useGetMacroTargetsQuery(() => getCurrentUserQuery.data?.id ?? '');
</script>

{#if !getCurrentUserQuery.data || getMacroTargetsQuery.data === undefined}
	<Skeleton class="h-67.5 w-full" />
	<Skeleton class="h-27 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else}
	<MacroTargetsForm targets={getMacroTargetsQuery.data} userId={getCurrentUserQuery.data.id} />
{/if}
