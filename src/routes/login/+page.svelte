<script lang="ts">
	import MyModal from '$lib/MyModal.svelte';
	import { signIn } from '@auth/sveltekit/client';
</script>

<svelte:head>
	<title>MyFit | Login</title>
</svelte:head>

<div class="flex flex-col items-center bg-secondary rounded-lg py-5 px-10 gap-3 w-full max-w-xs">
	<h3 class="text-black font-semibold">Login to continue</h3>
	<MyModal title="Redirecting" titleColor="text-accent">
		<button
			class="btn gap-2 btn-primary normal-case w-full"
			on:click={() => {
				signIn('google');
			}}
			slot="openButton"
		>
			<img src="/google_logo.png" alt="Google logo" height="30" width="30" />
			Sign in with Google
		</button>
		<button class="btn btn-accent normal-case" slot="content">
			<span class="loading loading-spinner" />
			Please wait
		</button>
	</MyModal>
</div>
