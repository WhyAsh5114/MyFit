<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { WorkoutWithMesoData } from '../../+page.server';

	let { workout }: { workout: WorkoutWithMesoData } = $props();

	function getMinuteDifference(date1: Date, date2: Date): number {
		const msInMinute = 60 * 1000;
		const diffInMs = Math.abs(date1.getTime() - date2.getTime());
		return Math.floor(diffInMs / msInMinute);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>
			{workout.startedAt.toLocaleDateString(undefined, {
				day: '2-digit',
				month: 'long'
			})}
		</Card.Title>
		<Card.Description>
			{workout.startedAt.toLocaleTimeString(undefined, {
				hour: '2-digit',
				minute: '2-digit'
			})}
			to
			{workout.endedAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
			({getMinuteDifference(workout.endedAt, workout.startedAt)} minutes)
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<p>Card Content</p>
	</Card.Content>
	<Card.Footer>
		<p>Card Footer</p>
	</Card.Footer>
</Card.Root>
