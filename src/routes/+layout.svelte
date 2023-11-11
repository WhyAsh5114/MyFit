<script>
	import "../app.postcss";
	import Hamburger from "$lib/Hamburger.svelte";
	import { page } from "$app/stores";
	import { signOut } from "@auth/sveltekit/client";
</script>

<div class="drawer lg:drawer-open">
	<input id="drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col items-center justify-center h-screen">
		<!-- Page content here -->
		<div class="flex bg-primary w-full items-center py-2 lg:hidden">
			<label for="drawer" class="btn btn-ghost drawer-button lg:hidden"><Hamburger /></label>
			<a href="/" class="flex items-center">
				<img src="/favicon.png" alt="logo" class="w-12 -mb-1 mr-1" />
				<h1 class="text-2xl font-bold text-white">MyFit</h1>
			</a>
		</div>
		<div class="flex h-px grow overflow-y-auto p-2 w-full justify-center">
			<main>
				<slot />
			</main>
		</div>
	</div>
	<div class="drawer-side">
		<label for="drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu p-4 w-80 min-h-full bg-primary text-base-content">
			<!-- Sidebar content here -->
			<li>
				<a class="bg-primary w-full items-center py-2 hidden lg:flex" href="/">
					<img src="/favicon.png" alt="logo" class="w-12 -mb-1 mr-1" />
					<h1 class="text-2xl font-bold text-white">MyFit</h1>
				</a>
			</li>
			<li><a>Sidebar Item 1</a></li>
			<li><a>Sidebar Item 2</a></li>
			{#if $page.data.session}
				<div class="dropdown dropdown-top mt-auto">
					<button class="btn btn-neutral w-full justify-start h-14">
						<img
							src={$page.data.session.user?.image}
							referrerpolicy="no-referrer"
							alt="profile"
							width="40"
							height="40"
							class="rounded-full avatar"
						/>
						<span class="grow text-center">{$page.data.session.user?.name}</span>
					</button>
					<ul class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-md w-52 my-1">
						<li><a href="/profile">Profile</a></li>
						<li><a href="/settings">Settings</a></li>
						<li><button class="text-error" on:click={() => signOut()}>Logout</button></li>
					</ul>
				</div>
			{:else}
				<a href="/login" class="btn w-full mt-auto">Login</a>
			{/if}
		</ul>
	</div>
</div>
