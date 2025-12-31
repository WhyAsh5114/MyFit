<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { ActivityEntry } from '$lib/server/generated/prisma/client';

	let { entry }: { entry: ActivityEntry } = $props();
</script>

<Card.Root class="py-4">
	<Card.Header class="px-4">
		<Card.Title>Daily activity</Card.Title>
		<Card.Description>
			{entry.quantity}
			{entry.quantityUnit} - {entry.calories} cals
		</Card.Description>
		<Card.Action>
			<Badge variant="secondary">System</Badge>
		</Card.Action>
	</Card.Header>
</Card.Root>
