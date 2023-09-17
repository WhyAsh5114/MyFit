<script lang="ts">
	export let data;
	import { page } from '$app/stores';
</script>

{#if !data.loggedIn}
	<p>Please login to continue</p>
{:else}
	<p class="font-semibold">Hi, {$page.data.session?.user?.name}</p>
	{#if !data.mesocycles}
		<p>You haven't created a mesocycle yet!</p>
		<a class="btn btn-accent mt-1.5" href="/mesocycles/new">Create mesocycle</a>
	{/if}
{/if}
