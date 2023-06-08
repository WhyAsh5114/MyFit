<script>
	import { navigating } from '$app/stores';
</script>

<a href="/mesocycles" class="btn btn-primary">
	{#if $navigating?.to?.url.pathname === '/mesocycles'}
		<span class="loading loading-spinner" />
	{/if}
	Mesocycles
</a>
