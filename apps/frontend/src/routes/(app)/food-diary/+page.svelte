<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { today, getLocalTimeZone } from '@internationalized/date';

	$effect(() => {
		goto(resolve(`/food-diary/${today(getLocalTimeZone()).toString()}`));
	});
</script>
