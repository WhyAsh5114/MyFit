<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import CircleHelp from 'virtual:icons/lucide/message-circle-question';
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
</script>

<div class={cn('flex w-full flex-col', className)}>
	<span class="mx-auto flex items-center gap-4 text-xl font-bold">
		FAQ
		<CircleHelp />
	</span>
	<Accordion.Root class="w-full">
		<Accordion.Item value="item-1">
			<Accordion.Trigger>Is it really free?</Accordion.Trigger>
			<Accordion.Content class="text-justify">
				The app is open-source and always will be. It's hosted on Vercel and CockroachDB's free tiers, but if we exceed
				limits, it can be run locally by anyone.
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-2">
			<Accordion.Trigger>How do I download it?</Accordion.Trigger>
			<Accordion.Content class="text-justify">
				The app is a PWA, usable as a website or installable on supported platforms via a download icon in the header.
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-3">
			<Accordion.Trigger>What if I need XYZ?</Accordion.Trigger>
			<Accordion.Content class="text-justify">
				Feel free to <a class="text-primary underline" href="https://github.com/WhyAsh5114/MyFit/issues"
					>open an issue</a
				>
				on the GitHub repository!
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-4">
			<Accordion.Trigger>Does it work offline?</Accordion.Trigger>
			<Accordion.Content class="text-justify">
				Not yet. There are plans to make it work offline and we are actively working on it!
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
