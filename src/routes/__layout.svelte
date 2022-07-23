<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	// If user is logged in, don't show Logout option
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
	import '../app.css';

	export let user: User | undefined;
</script>

<div class="navbar bg-base-100 gap-2 md:h-20 lg:h-24">
	<a
		class="btn no-animation h-full normal-case text-xl md:text-2xl lg:text-4xl btn-primary flex-grow gap-2"
		href="/"
	>
		<img src="/favicon.png" alt="logo" width="40" />
		MyFit
	</a>
	<div class="dropdown dropdown-end ml-auto h-full">
		<button
			tabindex="0"
			class="btn no-animation btn-primary btn-square lg:px-1.5 h-full avatar lg:w-20"
		>
			<div class="rounded-full w-8 md:w-9 lg:w-12">
				<img src="/profile.png" alt="profile-pic" />
			</div>
		</button>
		<ul
			tabindex="0"
			class="mt-3 md:p-1 lg:p-2 shadow menu menu-compact dropdown-content bg-secondary text-black font-semibold rounded-md"
			data-test-id="profile-options-dropdown"
		>
			{#if user}
				<li>
					<a href="/profile">Profile</a>
				</li>
				<li><a href="/profile/settings">Settings</a></li>
				<li><button>Logout</button></li>
			{:else}
				<li><a href="/profile/login">Login</a></li>
				<li><a href="/profile/register">Register</a></li>
			{/if}
		</ul>
	</div>
</div>
<div class="px-2 py-0.5 h-full">
	<slot />
</div>
