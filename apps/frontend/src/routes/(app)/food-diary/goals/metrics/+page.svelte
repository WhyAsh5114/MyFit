<script lang="ts">
	import MetricsForm from './components/metrics-form.svelte';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { useGetMetricsQuery } from '$lib/features/food-diary/metrics/get-metrics';

	const getCurrentUserQuery = useGetCurrentUserQuery();
	const getMetricsQuery = useGetMetricsQuery(() => getCurrentUserQuery.data?.id ?? '');
</script>

{#if !getCurrentUserQuery.data || getMetricsQuery.data === undefined}
	<Skeleton class="h-86 w-full" />
{:else}
	<MetricsForm metrics={getMetricsQuery.data} userId={getCurrentUserQuery.data.id} />
{/if}
