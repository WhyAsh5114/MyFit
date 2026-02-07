import { m } from '$lib/paraglide/messages';
import { BlocksIcon, SettingsIcon, GithubIcon, CodeXmlIcon } from '@lucide/svelte';

export const sidebarLinks = [
	{
		title: 'Application',
		items: [
			{
				title: m['nav.dashboard'](),
				url: '/dashboard',
				icon: BlocksIcon
			},
			{
				title: m['nav.settings'](),
				url: '/settings',
				icon: SettingsIcon
			}
		]
	},
	{
		title: 'External',
		items: [
			{
				title: m['nav.github'](),
				url: 'https://github.com/WhyAsh5114/MyFit',
				icon: GithubIcon
			},
			{
				title: m['nav.developerSite'](),
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
