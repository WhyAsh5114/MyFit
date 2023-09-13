<script lang="ts">
	export let data;
	import { page } from '$app/stores';
</script>

{#if data.notLoggedIn}
	<p>Please login to continue</p>
{:else}
	<p class="font-semibold">Hi, {$page.data.session?.user?.name}</p>
{/if}
