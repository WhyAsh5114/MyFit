<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ session }) => {
		if (session?.user) {
			return {
				props: {
					user: session.user
				}
			};
		} else {
			return {};
		}
	};
</script>

<script lang="ts">
	export let user: UserData;

	async function logout() {
		await fetch('/api/auth/logout', {
			method: 'GET'
		});
		// TODO: fix (change to goto()) once SvelteKit solves #4426
		window.location.href = '/profile/login';
	}
</script>

<div class="flex flex-col w-full place-items-center h-full justify-center gap-3">
	{#if user}
		<p>{JSON.stringify(user)}</p>
		<button class="btn no-animation btn-sm normal-case btn-error w-fit" on:click={logout}
			>Logout</button
		>
	{:else}
		<p class="text-lg lg:text-xl">You haven't logged in yet</p>
		<div class="flex gap-5">
			<button class="btn normal-case bg-primary lg:text-lg no-animation"> Login </button>
			<button class="btn normal-case bg-primary lg:text-lg no-animation">
				Create an account
			</button>
		</div>
	{/if}
</div>
