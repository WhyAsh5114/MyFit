<script lang="ts">
	import '../app.postcss';
	import PWAButton from './PWAButton.svelte';
	import { page } from '$app/stores';
</script>

<div class="navbar bg-primary">
	<div class="flex-1">
		<img src="/favicon.png" alt="" width="40" height="40" />
		<a class="btn btn-ghost normal-case text-2xl text-white" href="/">MyFit</a>
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
				{#if $page.data.session}
					<li><a href="/profile">Profile</a></li>
					<li><a href="/settings">Settings</a></li>
				{/if}
				{#if $page.data.session}
					<li><a href="/logout">Logout</a></li>
				{:else}
					<li><a href="/login">Login</a></li>
				{/if}
			</ul>
		</div>
	</div>
</div>
