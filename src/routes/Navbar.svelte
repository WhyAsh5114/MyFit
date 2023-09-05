<script lang="ts">
	import '../app.postcss';
	import PWAButton from './PWAButton.svelte';
	import { navigating, page } from '$app/stores';
	import MyModal from '$lib/components/MyModal.svelte';
	import { signOut } from '@auth/sveltekit/client';

	let logoutModal: HTMLDialogElement;
	let updatingModal: HTMLDialogElement;
	let showIndicator = false;
</script>

<MyModal title="Updating" bind:dialogElement={updatingModal}>
	<button class="btn btn-accent normal-case">
		<span class="loading loading-spinner" />
		Please wait
	</button>
</MyModal>
<div class="navbar bg-primary z-10">
	<div class="flex-1">
		<div class="h-10 w-10 relative">
			{#if $navigating?.to}
				<div class="bg-primary w-10 h-10 absolute z-20 grid place-items-center">
					<span class="loading loading-spinner text-accent" />
				</div>
			{/if}
			<img src="/favicon.png" alt="" class="absolute" width="40" height="40" />
		</div>
		<h1><a class="btn btn-ghost normal-case text-2xl text-white" href="/">MyFit</a></h1>
	</div>
	<div class="flex-none">
		<div class="dropdown dropdown-end">
			<button
				class="btn btn-ghost btn-circle avatar {showIndicator ? 'indicator' : ''}"
				on:click={() => (showIndicator = false)}
			>
				{#if showIndicator}
					<span class="indicator-item badge badge-accent badge-xs animate-pulse mx-1.5 my-1.5" />
				{/if}
				<div class="w-10 rounded-full">
					{#if $page.data.session}
						<img src={$page.data.session.user?.image} referrerpolicy="no-referrer" alt="profile" width="40" height="40" />
					{:else}
						<img src="/profile.webp" alt="profile" width="40" height="40" />
					{/if}
				</div>
			</button>

			<ul class="menu dropdown-content mt-3 p-2 shadow bg-secondary text-black font-semibold rounded-box">
				<PWAButton bind:updatingModal bind:showIndicator />
				{#if $page.data.session}
					<li><a href="/profile">Profile</a></li>
					<li><a href="/settings">Settings</a></li>
				{/if}
				{#if $page.data.session}
					<li>
						<button
							on:click={() => {
								logoutModal.show();
								signOut();
							}}>Logout</button
						>
					</li>
				{:else}
					<li><a href="/login">Login</a></li>
				{/if}
			</ul>
		</div>
	</div>
</div>
<MyModal title="Logout" titleColor="text-error" bind:dialogElement={logoutModal}>
	<button class="btn btn-error normal-case text-black">
		<span class="loading loading-spinner" />
		Please wait
	</button>
</MyModal>
