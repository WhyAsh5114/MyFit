<script lang="ts">
	import '../app.postcss';
	import { pwaInfo } from 'virtual:pwa-info';
	import PWAButton from './PWAButton.svelte';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
	{@html webManifest}
	<title>MyFit</title>
</svelte:head>

<div class="navbar bg-primary">
	<div class="flex-1">
		<img src="/favicon.png" alt="" width="40" height="40" />
		<a class="btn btn-ghost normal-case text-xl text-white" href="/">MyFit</a>
	</div>
	<div class="flex-none">
		<div class="dropdown dropdown-end">
			<button class="btn btn-ghost btn-circle avatar">
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
						<img src="/profile.webp" alt="profile" />
					{/if}
				</div>
			</button>
			<ul
				class="menu dropdown-content mt-3 p-2 shadow bg-secondary text-black font-semibold rounded-box"
			>
				<PWAButton />
				<li>
					<a> Profile </a>
				</li>
				<li><a>Settings</a></li>
				{#if $page.data.session}
					<li><button on:click={() => signOut()}>Logout</button></li>
				{:else}
					<li><button on:click={() => signIn()}>Login</button></li>
				{/if}
			</ul>
		</div>
	</div>
</div>
<slot />
