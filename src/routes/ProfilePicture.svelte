<script lang="ts">
	import '../app.postcss';
	import { page } from '$app/stores';
	import { ShowIndicator } from './homeStore';
</script>

<button
	class="btn btn-ghost btn-circle avatar {$ShowIndicator ? 'indicator' : ''}"
	on:click={() => ShowIndicator.set(false)}
>
	{#if $ShowIndicator}
		<span class="indicator-item badge badge-accent badge-xs animate-pulse mx-1.5 my-1.5" />
	{/if}
	<div class="w-10 rounded-full">
		{#if $page.data.session}
			<img
				src={$page.data.session.user?.image}
				referrerpolicy="no-referrer"
				alt="profile"
				width="40"
				height="40"
			/>
		{:else}
			<img src="/profile.webp" alt="profile" width="40" height="40" />
		{/if}
	</div>
</button>
