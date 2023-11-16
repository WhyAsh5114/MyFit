import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response("Invalid session", {
			status: 403
		});
	}

	const { mesocycleTemplate }: APIMesocyclesCreate = await request.json();
	const client = await clientPromise;
	try {
		await client
			.db()
			.collection("users")
			.updateOne(
				{ email: session.user?.email },
				{ $push: { mesocycleTemplates: mesocycleTemplate } }
			);

		return new Response("Mesocycle created successfully", {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
