<script lang="ts">
	import { goto } from '$app/navigation';

	let username: string;
	let password: string;

	let modalHeading: string;
    let modalHeadingColor: string;
	let modalText: string;
	let modal: HTMLInputElement;

	async function login() {
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username,
					password
				})
			});
			if (res.ok) {
				goto('/profile');
			} else {
				const body = await res.json();
				modalHeading = 'Error';
                modalHeadingColor = 'text-red-500';
				modalText = body.message;
				modal.checked = true;
			}
		} catch (err) {}
	}
</script>

<!-- Modal -->
<input type="checkbox" id="my-modal-4" class="modal-toggle" bind:this={modal} />
<label for="my-modal-4" class="modal cursor-pointer">
	<label class="modal-box relative bg-primary" for="">
		<h3 class="text-lg font-bold {modalHeadingColor}">{modalHeading}</h3>
		<p class="py-4">{modalText}</p>
	</label>
</label>

<!-- Login form -->
<form class="flex w-full justify-center h-full items-center" on:submit|preventDefault>
	<div class="bg-secondary w-1/5 px-5 pt-4 rounded-md flex flex-col">
		<h3 class="text-stone-800 text-center font-semibold text-xl">Welcome</h3>
		<h4 class="text-stone-900 text-center mb-3">Login to continue</h4>
		<input
			type="text"
			placeholder="Username"
			bind:value={username}
			class="input bg-white text-black border-2 -my-px border-stone-400 hover:border-stone-500 focus:border-black focus:z-10 rounded-none input-bordered w-full"
		/>
		<input
			type="password"
			placeholder="Password"
			bind:value={password}
			class="input bg-white text-black border-2 -my-px border-stone-400 hover:border-stone-500 focus:border-black rounded-none input-bordered w-full"
		/>
		<a href="/profile/forgot_password" class="mb-2 mt-1 text-blue-600">Forgot your password?</a>
		<button
			class="btn btn-sm rounded-sm normal-case btn-accent no-animation font-normal text-lg shadow-md"
			on:click={login}>Submit</button
		>
		<div class="w-full h-px bg-primary mt-6" />
		<a href="/profile/register" class="mb-2 mt-1 text-blue-600 text-center">Create an account</a>
	</div>
</form>
