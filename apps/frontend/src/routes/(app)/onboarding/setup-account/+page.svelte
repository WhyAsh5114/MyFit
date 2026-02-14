<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import SetupAccountForm from './setup-account-form.svelte';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { m } from '$lib/paraglide/messages';

	const getCurrentUserQuery = useGetCurrentUserQuery();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['onboarding.setupAccountTitle']()}</Card.Title>
		<Card.Description>{m['onboarding.setupAccountDescription']()}</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if !getCurrentUserQuery.data}
			<Skeleton class="h-25.5" />
		{:else}
			<SetupAccountForm data={getCurrentUserQuery.data} />
		{/if}
	</Card.Content>
</Card.Root>
