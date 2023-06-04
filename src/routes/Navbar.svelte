<script lang="ts">
	import '../app.postcss';
	import PWAButton from './PWAButton.svelte';
	import { page } from '$app/stores';
	import MyModal from '$lib/MyModal.svelte';
	import { signOut } from '@auth/sveltekit/client';
	import ProfilePicture from './ProfilePicture.svelte';

	let logoutModal: HTMLDialogElement;
	let updatingModal: HTMLDialogElement;
</script>

<MyModal title="Updating" bind:dialogElement={updatingModal}>
	<button class="btn btn-accent normal-case">
		<span class="loading loading-spinner" />
		Please wait
	</button>
</MyModal>
<div class="navbar bg-primary">
	<div class="flex-1">
		<img src="/favicon.png" alt="" width="40" height="40" />
		<h1><a class="btn btn-ghost normal-case text-2xl text-white" href="/">MyFit</a></h1>
	</div>
	<div class="flex-none">
		<div class="dropdown dropdown-end">
				<ProfilePicture />
			<ul
				class="menu dropdown-content mt-3 p-2 shadow bg-secondary text-black font-semibold rounded-box"
			>
				<PWAButton bind:updatingModal />
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
