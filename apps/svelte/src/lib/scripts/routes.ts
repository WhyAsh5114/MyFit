import fs, { writeFileSync } from 'fs';
import path from 'path';

export type StepRoutesMap = Record<
	string,
	Array<{ href: string; label: string; metadata: Record<string, string> }>
>;

function findStepRoutes(): StepRoutesMap {
	const routesMap: StepRoutesMap = {};

	const routesDir = path.join(process.cwd(), 'src', 'routes');

	if (!fs.existsSync(routesDir)) {
		console.warn(`Routes directory not found: ${routesDir}`);
		return routesMap;
	}

	const processDirectory = (dirPath: string, routePrefix: string) => {
		const stepRoutes = findStepRoutesInDir(dirPath, routePrefix);

		if (stepRoutes.length > 0) {
			const cleanedRoutePrefix = routePrefix.replace(/\(.*?\)/g, '').replace(/\/+/g, '/');
			routesMap[cleanedRoutePrefix] = stepRoutes;
		}

		const entries = fs.readdirSync(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			if (entry.isDirectory() && !entry.name.startsWith('_')) {
				const subdirPath = path.join(dirPath, entry.name);
				const subdirPrefix = `${routePrefix}/${entry.name}`.replace(/\/+/g, '/');
				processDirectory(subdirPath, subdirPrefix);
			}
		}
	};

	processDirectory(routesDir, '');

	return routesMap;
}

function findStepRoutesInDir(
	dirPath: string,
	routePrefix: string
): Array<{ href: string; label: string; metadata: Record<string, string> }> {
	try {
		const entries = fs.readdirSync(dirPath, { withFileTypes: true });
		const stepDirs = entries
			.filter((entry) => entry.isDirectory() && /^\d+-/.test(entry.name))
			.map((entry) => {
				const stepNumber = entry.name.split('-')[0];
				const restOfName = entry.name.substring(entry.name.indexOf('-') + 1);
				const label = restOfName
					.split('-')
					.map((word, idx) => (idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
					.join(' ');

				let href = `${routePrefix}/${entry.name}`.replace(/\/+/g, '/');
				href = href.replace(/\(.*?\)/g, '');
				href = href.replace(/\/+/g, '/');

				let metadata: Record<string, string> = {};
				const sveltePath = path.join(dirPath, entry.name, '+page.svelte');
				if (fs.existsSync(sveltePath)) {
					const content = fs.readFileSync(sveltePath, 'utf8');
					metadata = extractMetaTags(content);
				}

				return {
					href,
					label: `${stepNumber}. ${label}`,
					metadata
				};
			})
			.sort((a, b) => {
				const aNum = parseInt(a.href.split('/').pop()?.split('-')[0] || '0');
				const bNum = parseInt(b.href.split('/').pop()?.split('-')[0] || '0');
				return aNum - bNum;
			});

		return stepDirs;
	} catch (err) {
		console.error(`Error reading directory ${dirPath}:`, err);
		return [];
	}
}

function extractMetaTags(content: string): Record<string, string> {
	try {
		const headMatch = content.match(/<svelte:head>([\s\S]*?)<\/svelte:head>/i);
		if (!headMatch) return {};

		const headContent = headMatch[1];

		const metaTags: Record<string, string> = {};
		const metaRegex = /<meta[^>]*name=["']([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
		let match;

		while ((match = metaRegex.exec(headContent)) !== null) {
			metaTags[match[1]] = match[2];
		}

		const titleMatch = headContent.match(/<title>(.*?)<\/title>/i);
		if (titleMatch) {
			metaTags['title'] = titleMatch[1];
		}

		return Object.keys(metaTags).length > 0 ? metaTags : {};
	} catch (error) {
		console.error('Error extracting meta tags:', error);
		return {};
	}
}

export async function getStepRoutesMap(props: {
	dev: boolean;
	building: boolean;
	fetch: typeof globalThis.fetch;
}): Promise<StepRoutesMap> {
	const { dev, building, fetch } = props;
	if (dev || building) return findStepRoutes();
	return fetch(`step-routes.json`).then((res) => res.json());
}

if (process.argv.includes('--create-json-file')) {
	const stepRoutesMap = findStepRoutes();
	writeFileSync('.vercel/output/static/step-routes.json', JSON.stringify(stepRoutesMap));
	writeFileSync('.svelte-kit/output/client/step-routes.json', JSON.stringify(stepRoutesMap));
}
