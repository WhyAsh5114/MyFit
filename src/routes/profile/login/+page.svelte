<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import MyModal from '$lib/MyModal.svelte';
    import { page as pageStore } from '$app/stores';

    let page = $pageStore.url.searchParams.get('page') || '/profile';

    let username = '';
    let password = '';

    let modalOpen = false;
    let modalTexts: string[];

    async function login() {
        let errors: string[] = [];
        if (!username) {
            errors.push('Username cannot be empty');
        }
        if (!password) {
            errors.push('Password cannot be empty');
        }

        if (errors.length > 0) {
            modalTexts = errors;
            modalOpen = true;
            return;
        }

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
                await invalidateAll();
                await goto(`${page}`);
            } else {
                const body = await res.text();
                modalTexts = [body];
                modalOpen = true;
            }
        } catch (err) {
            console.error(err);
            modalTexts = ['Check console for more information'];
            modalOpen = true;
        }
    }
</script>

<svelte:head>
    <title>MyFit | Login</title>
</svelte:head>
<MyModal {modalTexts} modalTitle="Error" bind:modalOpen />
<form class="flex w-full justify-center h-full items-center" on:submit|preventDefault>
    <div class="bg-secondary w-3/4 max-w-sm px-5 pt-4 rounded-md flex flex-col">
        <h3 class="text-stone-800 text-center font-semibold text-xl">Welcome</h3>
        <h4 class="text-stone-900 text-center mb-3">Login to continue</h4>
        <input
            type="text"
            placeholder="Username"
            bind:value={username}
            class="input bg-white text-black border-2 -my-px border-stone-400 hover:border-stone-500 focus:border-black focus:z-10 hover:z-10 rounded-none input-bordered w-full"
        />
        <input
            type="password"
            placeholder="Password"
            bind:value={password}
            class="input bg-white text-black border-2 -my-px border-stone-400 hover:border-stone-500 focus:border-black rounded-none input-bordered w-full"
        />
        <a href="/profile/forgot_password" class="mb-2 mt-1 text-blue-600">Forgot your password?</a>
        <button
            class="btn btn-sm rounded-sm normal-case btn-accent lg:text-lg shadow-md"
            on:click={login}>Submit</button
        >
        <div class="w-full h-px bg-primary mt-6" />
        <a href="/profile/register" class="mb-2 mt-1 text-blue-600 text-center">Create an account</a
        >
    </div>
</form>
