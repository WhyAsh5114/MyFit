<script>
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Menu from 'lucide-svelte/icons/menu';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import { Button } from '$lib/components/ui/button';
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
					<Sheet.Title><h1>MyFit</h1></Sheet.Title>
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
	<div class="hidden h-screen flex-col p-10 lg:flex w-full">
		<Button variant="link" class="justify-start">
			<a class="flex items-center gap-2" href="/">
				<img src="/favicon.webp" alt="MyFit logo" width={72} height={72} />
				<h1 class="text-4xl font-bold">MyFit</h1>
			</a>
		</Button>
		<ul class="mb-auto mt-8">
			<li>
				<Button variant="link" class="text-base">
					<a href="/exercise-splits">Workouts</a>
				</Button>
			</li>
			<li>
				<Button variant="link" class="text-base">
					<a href="/exercise-splits">Mesocycles</a>
				</Button>
			</li>
			<li>
				<Button variant="link" class="text-base">
					<a href="/exercise-splits">Exercise splits</a>
				</Button>
			</li>
		</ul>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="outline" class="h-14 justify-evenly">
					<Avatar.Root class="h-9 w-9">
						<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
						<Avatar.Fallback>CN</Avatar.Fallback>
					</Avatar.Root>
					<span class="text-base font-medium">User name</span>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start">
				<DropdownMenu.Group>
					<DropdownMenu.Item>Profile</DropdownMenu.Item>
					<DropdownMenu.Item>Settings</DropdownMenu.Item>
					<DropdownMenu.Item class="text-red-500">Log out</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
<main class="mx-auto flex h-px max-w-2xl grow flex-col overflow-y-auto px-2 py-6 lg:h-screen">
	<slot />
</main>

<style lang="postcss">
	.horizontal-screen {
		@apply lg:basis-96 lg:border-b-0 lg:border-r;
	}
</style>
