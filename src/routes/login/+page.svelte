<script lang="ts">
	import { page } from '$app/stores';
	import MyModal from '$lib/components/MyModal.svelte';
	import { signIn } from '@auth/sveltekit/client';

	let redirectingModal: HTMLDialogElement;
</script>

<svelte:head>
	<title>MyFit | Login</title>
</svelte:head>

<MyModal title="Redirecting" titleColor="text-accent" bind:dialogElement={redirectingModal}>
	<button class="btn btn-accent normal-case">
		<span class="loading loading-spinner" />
		Please wait
	</button>
</MyModal>
<div class="flex flex-col items-center bg-secondary rounded-lg py-5 px-10 gap-3 w-full max-w-xs">
	<h3 class="text-black font-semibold">Login to continue</h3>
	<button
		class="btn justify-around btn-primary normal-case w-full"
		on:click={() => {
			redirectingModal.show();
			signIn('google', { callbackUrl: $page.url.searchParams.get('callbackURL') || '' });
		}}
	>
		<img src="/google_logo.png" alt="Google logo" height="30" width="30" />
		Sign in with Google
	</button>
	<button
		class="btn justify-around btn-primary normal-case w-full"
		on:click={() => {
			redirectingModal.show();
			signIn('github', { callbackUrl: $page.url.searchParams.get('callbackURL') || '' });
		}}
	>
		<img src="/github-dark.svg" alt="Github logo" height="30" width="30" />
		Sign in with Github
	</button>
</div>
