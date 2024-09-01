<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { signOut } from '@auth/sveltekit/client';
	import UserIcon from 'virtual:icons/lucide/user';
	import SettingsIcon from 'virtual:icons/lucide/settings';
	import LogoutIcon from 'virtual:icons/lucide/log-out';
</script>

<DropdownMenu.Content align="start">
	<DropdownMenu.Group>
		<DropdownMenu.Item class="gap-2" href="/profile">
			<UserIcon />
			Profile
		</DropdownMenu.Item>
		<DropdownMenu.Item class="gap-2" href="/settings">
			<SettingsIcon />
			Settings
		</DropdownMenu.Item>
		<DropdownMenu.Item class="gap-2 text-red-500" onclick={() => signOut()}>
			<LogoutIcon />
			Logout
		</DropdownMenu.Item>
	</DropdownMenu.Group>
</DropdownMenu.Content>
