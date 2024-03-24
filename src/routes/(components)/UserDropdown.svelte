<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { signOut } from '@auth/sveltekit/client';

	// TODO: profile and settings page, then links here
</script>

<DropdownMenu.Content align="start">
	<DropdownMenu.Group>
		<DropdownMenu.Item>Profile</DropdownMenu.Item>
		<DropdownMenu.Item>Settings</DropdownMenu.Item>
		<DropdownMenu.Item class="text-red-500" on:click={() => signOut()}>Logout</DropdownMenu.Item>
	</DropdownMenu.Group>
</DropdownMenu.Content>
