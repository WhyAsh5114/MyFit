<script lang="ts">
	import { page } from "$app/stores";
</script>

<h2>Profile</h2>
<p>Hello {$page.data.session?.user?.name}</p>
<p>{$page.data.session?.user?.email}</p>
