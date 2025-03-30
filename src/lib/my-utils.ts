export function kebabToCamel(str: string) {
	return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
}

export function kebabToNormal(str: string) {
	return str.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function pascalToNormal(str: string) {
	return str.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase());
}
