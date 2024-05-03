<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { signOut } from '@auth/sveltekit/client';

	// TODO: profile and settings page, then links here
</script>

<DropdownMenu.Content align="start">
	<DropdownMenu.Group>
		<DropdownMenu.Item href="/profile">Profile</DropdownMenu.Item>
		<DropdownMenu.Item href="/settings">Settings</DropdownMenu.Item>
		<DropdownMenu.Item class="text-red-500" onclick={() => signOut()}>Logout</DropdownMenu.Item>
	</DropdownMenu.Group>
</DropdownMenu.Content>
