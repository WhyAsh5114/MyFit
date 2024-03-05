<script>
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Menu from 'lucide-svelte/icons/menu';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
</script>

<ModeWatcher />
<header class="horizontal-screen flex shrink-0 items-center gap-2 border-b px-3 py-1">
	<div class="contents lg:hidden">
		<Sheet.Root>
			<Sheet.Trigger aria-label="Menu">
				<Menu />
			</Sheet.Trigger>
			<Sheet.Content side="left">
				<Sheet.Header>
					<Sheet.Title>MyFit</Sheet.Title>
				</Sheet.Header>
			</Sheet.Content>
		</Sheet.Root>
		<a href="/" class="mr-auto">
			<img src="/favicon.webp" alt="MyFit logo" width={40} height={40} />
		</a>
		<ModeToggle />
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Avatar.Root class="h-9 w-9">
					<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
					<Avatar.Fallback>CN</Avatar.Fallback>
				</Avatar.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>Profile</DropdownMenu.Item>
					<DropdownMenu.Item>Settings</DropdownMenu.Item>
					<DropdownMenu.Item class="text-red-500">Log out</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="hidden h-screen flex-col lg:flex">horizontal navbar</div>
</header>
<main class="flex h-px max-w-2xl mx-auto grow flex-col overflow-y-auto px-2 py-6 lg:h-screen">
	<slot />
</main>

<style lang="postcss">
	.horizontal-screen {
		@apply lg:basis-96 lg:border-b-0 lg:border-r;
	}
</style>
