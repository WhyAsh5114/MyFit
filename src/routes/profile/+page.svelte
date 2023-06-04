<script lang="ts">
	import { page } from '$app/stores';
</script>

<h3>Hello {$page.data.session?.user?.name}</h3>
