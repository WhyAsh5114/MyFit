<script lang="ts">
	export let data;
</script>

{#if !data.loggedIn}
	<p>Please login to continue</p>
{:else}
	{#if !data.mesocycles}
		<p class="my-auto">You haven't created a mesocycle yet!</p>
		<a class="btn btn-primary btn-block" href="/mesocycles/new">Create mesocycle</a>
	{/if}
{/if}
