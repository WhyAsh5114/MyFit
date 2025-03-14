<script lang="ts">
	import { authClient } from '$lib/auth/auth-client';
	import { client } from '$lib/idb-client';

	const session = authClient.useSession();

	$effect(() => {
		syncIdbWithSession();
	});

	async function syncIdbWithSession() {
		if ($session.isPending || $session.isRefetching) return;

		const sessionData = $session.data;
		if (!sessionData) return await client.user.deleteMany();

		if (!(await client.user.findUnique({ where: { id: sessionData.user.id } }))) {
			await client.user.create({ data: sessionData.user });
		}
	}
</script>
