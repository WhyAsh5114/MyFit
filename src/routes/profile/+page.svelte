<script lang="ts">
  import { page } from "$app/stores";
  $: ({ data } = $page);
</script>

<h2>Profile</h2>
<p>Hello {data.session?.user?.name}</p>
<p>{data.session?.user?.email}</p>
