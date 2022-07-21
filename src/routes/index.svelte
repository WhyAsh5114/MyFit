<script>
	import MenuButton from '../lib/MenuButton.svelte';
</script>

<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
	<MenuButton
		title="Splits"
		description="Make weekly routines, modify current split"
		imagePath="/calendar.svg"
		link="/splits"
	/>
	<MenuButton
		title="Logging"
		description="Log workout, cardio, nutrition, and more"
		imagePath="/dumbbell.svg"
		link="/workouts"
	/>
    <MenuButton
		title="Records"
		description="See and modify logged stats like workout and cardio"
		imagePath="/record.svg"
		link="/records"
	/>
    <MenuButton
		title="Tracking"
		description="Visualize your progress using multiple metrics"
		imagePath="/graph.svg"
		link="/tracking"
	/>
</div>
