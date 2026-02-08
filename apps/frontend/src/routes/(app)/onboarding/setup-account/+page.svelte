<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import SetupAccountForm from './components/setup-account-form.svelte';
	import { useCurrentUserQuery } from '$lib/queries/user/get-current-user.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	const currentUserQuery = useCurrentUserQuery();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Setup account</Card.Title>
		<Card.Description>Set up your account details</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if !currentUserQuery.data}
			<Skeleton class="h-25.5" />
		{:else}
			<SetupAccountForm data={currentUserQuery.data} />
		{/if}
	</Card.Content>
</Card.Root>
