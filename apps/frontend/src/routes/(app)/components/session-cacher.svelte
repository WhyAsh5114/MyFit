<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/clients/auth-client';
	import { getClient } from '$lib/clients/idb-client';
	import { toast } from 'svelte-sonner';
	import { isUnprotectedRoute } from './constants';
	import { PrismaIDBClient } from '@myfit/api/prisma-idb/client';
	import {
		createUserForCurrentSession,
		getCachedUserOnClient,
		getOfflineUser,
		redirectToLogin
	} from './db';

	const session = authClient.useSession();
	let client = $state<PrismaIDBClient>()!;

	$effect(() => {
		if (page.url) {
			client = getClient();
			syncIdbWithSession().catch((error) => {
				console.error('Error syncing session:', error);
				toast.error('Failed to sync session');
			});
		}
	});

	async function syncIdbWithSession() {
		if ($session.isPending || $session.isRefetching) return;
		const { existingUser } = await getCachedUserOnClient(client, $session.data);

		if (!$session.data && !existingUser) {
			if (await getOfflineUser(client)) return;

			if (!isUnprotectedRoute(page.url.pathname)) {
				await redirectToLogin(client, page.url);
			}
		}

		if ($session.data && !existingUser) {
			await createUserForCurrentSession(client, $session.data);
		}
	}
</script>
