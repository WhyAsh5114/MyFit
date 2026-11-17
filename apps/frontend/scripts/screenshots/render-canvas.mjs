// Renders the screens canvas from `screenshots/manifest.json`: one row of phone frames per area, which
// pans and zooms. `serve.mjs` calls it on every page load, so a new capture shows on reload.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const template = readFileSync(join(import.meta.dirname, 'canvas.template.html'), 'utf8');

/** Areas appear in this order, then any others in the order they were captured. */
const ORDER = ['Account', 'Home', 'Food diary', 'Goals', 'Add food', 'Chat'];

const escape = (value) =>
	String(value).replace(
		/[&<>"]/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
	);

/** @param {string} manifestPath the capture's manifest; images are referred to relative to it */
export function renderCanvas(manifestPath) {
	const { ext, screens, capturedAt } = JSON.parse(readFileSync(manifestPath, 'utf8'));
	const groupNames = [...new Set([...ORDER, ...screens.map((s) => s.group)])].filter((g) =>
		screens.some((s) => s.group === g)
	);

	const sections = groupNames
		.map((group) => {
			const inGroup = screens.filter((s) => s.group === group);
			const figures = inGroup
				.map((s) => {
					const title = escape(s.title);
					return `<figure class="fig"><figcaption><b>${title}</b><span>${escape(s.note)}</span></figcaption>
<button type="button" class="shots" aria-label="Enlarge: ${title}">
<img class="lt" decoding="async" alt="${title}, light" src="light/${s.id}.${ext}">
<img class="dk" decoding="async" alt="${title}, dark" src="dark/${s.id}.${ext}"></button></figure>`;
				})
				.join('');
			return `<section class="area" data-group="${escape(group)}"><h2>${escape(group)}<small>${inGroup.length} screens</small></h2><div class="frames">${figures}</div></section>`;
		})
		.join('');

	const groups = groupNames.map((name) => ({
		name,
		count: screens.filter((s) => s.group === name).length
	}));
	const date = capturedAt ? new Date(capturedAt) : null;
	return template
		.replace('__SECTIONS__', () => sections)
		.replace('__GROUPS__', () => JSON.stringify(groups))
		.replace('__COUNT__', String(screens.length))
		.replace(
			'__DATE__',
			date
				? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
				: 'date unknown'
		);
}
