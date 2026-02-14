<script lang="ts">
	import MetricsForm from './metrics-form.svelte';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { useGetMacroMetricsQuery } from '$lib/features/food-diary/macro-metrics/get-macro-metrics';

	const getCurrentUserQuery = useGetCurrentUserQuery();
	const getMacroMetricsQuery = useGetMacroMetricsQuery(() => getCurrentUserQuery.data?.id ?? '');
</script>

{#if !getCurrentUserQuery.data || getMacroMetricsQuery.data === undefined}
	<Skeleton class="h-86 w-full" />
{:else}
	<MetricsForm metrics={getMacroMetricsQuery.data} userId={getCurrentUserQuery.data.id} />
{/if}
