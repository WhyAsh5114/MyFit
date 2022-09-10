<script lang="ts">
    import MyModal from '$lib/MyModal.svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    let username = '';
    let password = '';
    let confirmPassword = '';
    let submitButton: HTMLButtonElement;

    let modalOpen = false;
    let modalTexts: string[];
    let modalTitle = 'Error';
    let onClose: () => void = () => {};

    async function register() {
        // Reset modal variable to default
        onClose = () => {};

        let errors: string[] = [];
        if (!username) {
            errors.push('Username cannot be empty');
        }
        if (!password) {
            errors.push('Password cannot be empty');
        }
        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }

        if (errors.length > 0) {
            modalTitle = 'Error';
            modalTexts = errors;
            modalOpen = true;
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
            const body = await res.text();
            if (res.ok) {
                modalTitle = 'Success';
                modalTexts = [body];
                submitButton.disabled = true;

                onClose = () => {
                    // Only pass page argument if one is provided here
                    const redirectTo = $page.url.searchParams.get('page');
                    if (redirectTo) {
                        goto(`/profile/login?page=${redirectTo}`);
                    } else {
                        goto(`/profile/login`);
                    }
                };
                modalOpen = true;
            } else {
                modalTitle = 'Error';
                modalTexts = [body];
                modalOpen = true;
            }
        } catch (err) {
            modalTitle = 'Error';
            modalTexts = ['Check console for more information'];
            modalOpen = true;
            console.error(err);
        }
    }
</script>

<svelte:head>
    <title>MyFit | Register</title>
</svelte:head>
<MyModal {modalTexts} {modalTitle} bind:onClose bind:modalOpen />
<form class="flex w-full justify-center h-full items-center" on:submit|preventDefault>
    <div class="bg-secondary w-3/4 max-w-sm px-5 pt-4 rounded-md flex flex-col">
        <h3 class="text-stone-800 text-center font-semibold text-xl">Welcome</h3>
        <h4 class="text-stone-900 text-center mb-3">Create an account</h4>
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
            class="input bg-white text-black border-2 -my-px border-stone-400 hover:border-stone-500 focus:border-black focus:z-10 hover:z-10 rounded-none input-bordered w-full"
        />
        <input
            type="password"
            placeholder="Confirm Password"
            bind:value={confirmPassword}
            class="input bg-white text-black border-2 -my-px border-stone-400 hover:border-stone-500 focus:border-black rounded-none input-bordered w-full"
        />
        <button
            class="btn btn-sm rounded-sm normal-case btn-accent lg:text-lg shadow-md mt-4"
            on:click={register}
            bind:this={submitButton}>Submit</button
        >
        <div class="w-full h-px bg-primary mt-6" />
        <a
            href="/profile/login?page={$page.url.pathname}"
            class="mb-2 mt-1 text-blue-600 text-center">Already have an account? Login</a
        >
    </div>
</form>
