<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth/auth-client';
	import { UNPROTECTED_ROUTES } from '$lib/constants';
	import { client } from '$lib/idb-client';
	import { toast } from 'svelte-sonner';

	const session = authClient.useSession();

	$effect(() => {
		if (page.url) syncIdbWithSession();
	});

	async function syncIdbWithSession() {
		if ($session.isPending || $session.isRefetching) return;

		const sessionData = $session.data;
		const existingUser = await client.user.findUnique({ where: { id: sessionData?.user.id } });

		if (!sessionData && !existingUser) {
			if (!UNPROTECTED_ROUTES.includes(page.url.pathname)) {
				goto(`/login?redirect=${encodeURIComponent(page.url.pathname)}`);
				return toast.info('Please login to continue');
			}
		}

		if (sessionData && !existingUser) {
			await client.user.create({ data: sessionData.user });
		}
	}
</script>
