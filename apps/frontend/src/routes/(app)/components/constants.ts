import { m } from '$lib/paraglide/messages';
import { BlocksIcon, SettingsIcon, GithubIcon, CodeXmlIcon } from '@lucide/svelte';

export const sidebarLinks = [
	{
		title: m['sidebar.group.application.title'](),
		items: [
			{
				title: m['sidebar.group.application.items.dashboard.title'](),
				url: '/dashboard',
				icon: BlocksIcon
			},
			{
				title: m['sidebar.group.application.items.settings.title'](),
				url: '/settings',
				icon: SettingsIcon
			}
		]
	},
	{
		title: 'External',
		items: [
			{
				title: m['sidebar.group.external.items.github.title'](),
				url: 'https://github.com/WhyAsh5114/MyFit',
				icon: GithubIcon
			},
			{
				title: m['sidebar.group.external.items.developer_site.title'](),
				url: 'https://whyash5114.com',
				icon: CodeXmlIcon
			}
		]
	}
] as const;

type ExternalLink = (typeof sidebarLinks)[1]['items'][number]['url'];

export function isExternalLink(url: string): url is ExternalLink {
	return url.startsWith('http://') || url.startsWith('https://');
}
