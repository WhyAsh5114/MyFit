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
	import LoginButton from '$lib/LoginButton.svelte';
	import MenuButton from '../lib/MenuButton.svelte';
	import RegisterButton from '$lib/RegisterButton.svelte';
	export let user: UserData | undefined;
</script>

<svelte:head>
	<title>MyFit</title>
</svelte:head>
<div class="flex w-full place-items-center justify-center flex-grow">
	<div class="flex flex-col gap-3 w-5/6 md:w-2/3 max-w-sm place-items-center">
		{#if user}
			<h3 class="text-center">
				<b>Hi {user.username}!</b><br /> You haven't created a schedule yet, create one in
				<b>Splits</b>
			</h3>
		{:else}
			<h3 class="text-center md:text-lg">
				<b>Hi there!</b><br /> You haven't logged in yet, login to use all the features of the app
			</h3>
			<div class="w-full h-px bg-white" />
			<div class="flex flex-col gap-2 justify-evenly md:w-1/3">
				<LoginButton classes="btn btn-sm btn-secondary" />
				<RegisterButton classes="btn btn-sm btn-secondary" />
			</div>
		{/if}
	</div>
</div>
<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
	<MenuButton title="Splits" imagePath="/calendar.svg" link="/splits" />
	<MenuButton title="Logging" imagePath="/pencil.svg" link="/logging" />
	<MenuButton title="Records" imagePath="/record.svg" link="/records" />
	<MenuButton title="Tracking" imagePath="/graph.svg" link="/tracking" />
</div>
