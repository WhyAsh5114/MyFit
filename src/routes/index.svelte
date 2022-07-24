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
	import MenuButton from '../lib/MenuButton.svelte';
	export let user: User | undefined;
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
				<a class="btn no-animation btn-sm btn-secondary" href="/profile/login?page=/">Login</a>
				<a class="btn no-animation btn-sm btn-secondary" href="/profile/register">Register</a>
			</div>
		{/if}
	</div>
</div>
<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
	<MenuButton
		title="Splits"
		description="Make weekly routines, modify current split"
		imagePath="/calendar.svg"
		link="/splits"
	/>
	<MenuButton
		title="Logging"
		description="Log workout, cardio, nutrition, and more"
		imagePath="/dumbbell.svg"
		link="/workouts"
	/>
	<MenuButton
		title="Records"
		description="See and modify logged stats like workout and cardio"
		imagePath="/record.svg"
		link="/records"
	/>
	<MenuButton
		title="Tracking"
		description="Visualize your progress using multiple metrics"
		imagePath="/graph.svg"
		link="/tracking"
	/>
</div>
