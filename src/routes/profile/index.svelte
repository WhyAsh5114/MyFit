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
			return {
				redirect: '/profile/login',
				status: 302
			};
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
	<p>Hi {user.username}</p>
	<button
		class="btn no-animation btn-sm normal-case btn-error w-fit"
		on:click={logout}
		data-test-id="profile-logout-button">Logout</button
	>
</div>
