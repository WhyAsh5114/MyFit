<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/clients/auth-client';
	import { getDb } from '$lib/clients/idb-client';
	import { toast } from 'svelte-sonner';
	import { isUnprotectedRoute } from './constants';
	import {
		createUserForCurrentSession,
		getCachedUserOnClient,
		getOfflineUser,
		redirectToLogin
	} from './db';

	const session = authClient.useSession();
	let creatingUser = $state(false);

	$effect(() => {
		if (page.url) {
			syncIdbWithSession().catch((error) => {
				console.error('Error syncing session:', error);
				toast.error('Failed to sync session');
			});
		}
	});

	async function syncIdbWithSession() {
		if ($session.isPending || $session.isRefetching) return;
		const db = await getDb();
		const { existingUser } = await getCachedUserOnClient(db, $session.data);

		if (!$session.data && !existingUser) {
			if (await getOfflineUser(db)) return;

			if (!isUnprotectedRoute(page.url.pathname)) {
				await redirectToLogin(page.url);
			}
		}

		if ($session.data && !existingUser && !creatingUser) {
			creatingUser = true;
			await createUserForCurrentSession(db, $session.data);
			creatingUser = false;
		}
	}
</script>
