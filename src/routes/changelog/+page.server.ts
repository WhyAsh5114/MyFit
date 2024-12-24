export const prerender = true;

type ReleaseData = { body: string; published_at: string; tag_name: string };

export const load = async () => {
	const response = await fetch('https://api.github.com/repos/WhyAsh5114/MyFit/releases');
	const body = await response.json();
	const releases = body.map(({ body, published_at, tag_name }: ReleaseData) => ({
		body,
		published_at,
		tag_name
	})) as ReleaseData[];
	return { releases };
};
