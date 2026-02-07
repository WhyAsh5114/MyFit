<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { BugIcon } from '@lucide/svelte';
	import DiscordIcon from '$lib/icons/discord-icon.svelte';
	import GithubIcon from '$lib/icons/github-icon.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['dashboard.betaTitle']()}</Card.Title>
		<Card.Description>
			{m['dashboard.betaDescription']()}
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col items-end gap-2">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props}>{m['dashboard.reportBugs']()} <BugIcon /></Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						{#snippet child({ props })}
							<a
								href="https://discord.com/invite/2g9YPD6PQu"
								target="_blank"
								rel="noopener noreferrer"
								{...props}
							>
								<DiscordIcon />
								Discord
							</a>
						{/snippet}
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						{#snippet child({ props })}
							<a
								href="https://github.com/WhyAsh5114/MyFit/issues"
								target="_blank"
								rel="noopener noreferrer"
								{...props}
							>
								<GithubIcon />
								GitHub
							</a>
						{/snippet}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Card.Content>
</Card.Root>
