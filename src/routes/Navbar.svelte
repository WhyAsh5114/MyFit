<script>
	import { page } from '$app/stores';
	import Hamburger from '$lib/Hamburger.svelte';
	import { signOut } from '@auth/sveltekit/client';
</script>

<div class="navbar bg-primary">
	<div class="flex-none">
		<label for="my-drawer" class="btn btn-square btn-ghost lg:hidden">
			<Hamburger />
		</label>
	</div>
	<div class="flex flex-1">
		<a class="btn btn-ghost normal-case text-2xl text-white" href="/">
			<img src="/favicon.png" alt="logo" class="w-10 place-self-end" />
			MyFit
		</a>
	</div>
	<div class="dropdown dropdown-end flex-none">
		<button class="btn btn-circle btn-ghost avatar p-1">
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
		<ul class="dropdown-content z-10 menu p-2 shadow bg-neutral font-semibold rounded-md w-fit">
			{#if !$page.data.session}
				<li><a href="/login">Login</a></li>
			{:else}
				<li><a href="/profile">Profile</a></li>
				<li><a href="/settings">Settings</a></li>
				<li><button on:click={() => signOut()}>Logout</button></li>
			{/if}
		</ul>
	</div>
</div>
