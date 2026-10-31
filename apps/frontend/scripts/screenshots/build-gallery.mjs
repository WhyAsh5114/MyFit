// Builds a browsable gallery from `screenshots/manifest.json`. Writes two files in `screenshots/`:
//   index.html    opens locally, and refers to the images beside it
//   gallery.html  one self-contained file, with the images embedded, for sharing or publishing
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '../..');
const out = join(root, 'screenshots');
const manifestPath = join(out, 'manifest.json');
if (!existsSync(manifestPath)) throw new Error('No screenshots yet. Run `pnpm screenshots` first.');

const { ext, screens } = JSON.parse(readFileSync(manifestPath, 'utf8'));
const template = readFileSync(join(import.meta.dirname, 'gallery.template.html'), 'utf8');
const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

/** Groups appear in this order, then any others in the order they were captured. */
const ORDER = ['Account', 'Home', 'Food diary', 'Goals', 'Add food', 'Chat'];
const groupNames = [...new Set([...ORDER, ...screens.map((s) => s.group)])].filter((g) =>
	screens.some((s) => s.group === g)
);

const escape = (value) =>
	String(value).replace(
		/[&<>"]/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
	);

function build(inline) {
	const src = (theme, id) =>
		inline
			? `data:${mime};base64,${readFileSync(join(out, theme, `${id}.${ext}`)).toString('base64')}`
			: `${theme}/${id}.${ext}`;

	const sections = groupNames
		.map((group) => {
			const figures = screens
				.filter((s) => s.group === group)
				.map((s) => {
					const title = escape(s.title);
					return `<div class="fig"><button type="button" class="shots" aria-label="Enlarge: ${title}">
<img class="lt" loading="lazy" decoding="async" alt="${title}, light" src="${src('light', s.id)}">
<img class="dk" loading="lazy" decoding="async" alt="${title}, dark" src="${src('dark', s.id)}"></button>
<div class="cap"><b>${title}</b><span>${escape(s.note)}</span></div></div>`;
				})
				.join('');
			return `<section data-group="${escape(group)}"><h2>${escape(group)}</h2><div class="grid">${figures}</div></section>`;
		})
		.join('');

	const groups = groupNames.map((name) => ({
		name,
		count: screens.filter((s) => s.group === name).length
	}));
	return template
		.replace('__SECTIONS__', () => sections)
		.replace('__GROUPS__', () => JSON.stringify(groups))
		.replace('__COUNT__', String(screens.length))
		.replace(
			'__DATE__',
			new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
		);
}

writeFileSync(join(out, 'index.html'), build(false));
writeFileSync(join(out, 'gallery.html'), build(true));
console.log(
	`Gallery for ${screens.length} screens:\n  ${join(out, 'index.html')}\n  ${join(out, 'gallery.html')} (self-contained)`
);
