import { m } from '$lib/paraglide/messages';
import {
	BlocksIcon,
	SettingsIcon,
	CodeXmlIcon,
	LockIcon,
	HeartHandshakeIcon,
	BookOpenIcon
} from '@lucide/svelte';
import GithubIcon from '$lib/icons/github-icon.svelte';

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
			},
			{
				title: m['nav.docs'](),
				url: '/docs',
				icon: BookOpenIcon
			}
		]
	},
	{
		title: 'Legal',
		items: [
			{
				title: m['legal.privacyPolicy'](),
				url: '/privacy-policy',
				icon: LockIcon
			},
			{
				title: m['legal.termsOfService'](),
				url: '/terms-of-service',
				icon: HeartHandshakeIcon
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

type ExternalLink = (typeof sidebarLinks)[2]['items'][number]['url'];

export function isExternalLink(url: string): url is ExternalLink {
	return url.startsWith('http://') || url.startsWith('https://');
}

const unprotectedRoutes = ['/', '/login', '/privacy-policy', '/terms-of-service'] as const;

export function isUnprotectedRoute(path: string): boolean {
	return unprotectedRoutes.includes(path as (typeof unprotectedRoutes)[number]);
}
