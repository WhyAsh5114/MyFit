<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	$effect(() => {
		goto(resolve(`/food-diary/${page.params.date}`));
	});
</script>
