<script lang="ts">
	import { page } from '$app/stores';

	console.log($page.data.session)
</script>

<p>Hello {$page.data.session?.user?.name}</p>
<p>{$page.data.session?.user?.email}</p>
