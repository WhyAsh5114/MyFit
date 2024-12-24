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

// * fix changelogShownOf to be release version instead of a boolean
// * compare it with the release version of the latest release and show dialog if needed
