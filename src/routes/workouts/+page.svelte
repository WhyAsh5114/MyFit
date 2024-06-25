<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import AddIcon from 'virtual:icons/lucide/plus';
</script>

<H2>Workouts</H2>
<Button aria-label="create-workout" href="/workouts/manage/start"><AddIcon /></Button>
