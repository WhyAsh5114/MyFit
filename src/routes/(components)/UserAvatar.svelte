<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import type { Session } from '@auth/sveltekit';

	let { session }: { session: Session } = $props();

	function getInitials(name?: string | null) {
		if (!name) return '';
		const names = name.split(' ');
		const initials = names.map((n) => n.charAt(0).toUpperCase()).join('');
		return initials;
	}
</script>

<Avatar.Root class="h-8 w-8">
	<Avatar.Image src={session.user?.image} alt="Profile picture" referrerpolicy="no-referrer" />
	<Avatar.Fallback>{getInitials(session.user?.name)}</Avatar.Fallback>
</Avatar.Root>
