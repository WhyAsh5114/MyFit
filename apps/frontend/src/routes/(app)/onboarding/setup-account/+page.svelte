<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import SetupAccountForm from './setup-account-form.svelte';
	import { getCurrentUser } from '#lib/features/user/current-user.svelte.js';
	import { m } from '#lib/paraglide/messages.js';

	const currentUser = $derived(getCurrentUser());
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['onboarding.setupAccountTitle']()}</Card.Title>
		<Card.Description>{m['onboarding.setupAccountDescription']()}</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if currentUser}
			<SetupAccountForm data={currentUser} />
		{/if}
	</Card.Content>
</Card.Root>
