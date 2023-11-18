import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return new Response("Invalid session", {
			status: 403
		});
	}

	const { mesocycleTemplateID }: APIMesocyclesDeleteTemplate = await request.json();
	const client = await clientPromise;
	try {
		const deleteResult = await client
			.db()
			.collection("mesocycleTemplates")
			.deleteOne({
				_id: new ObjectId(mesocycleTemplateID),
				userId: new ObjectId(session.user.id)
			});

		if (deleteResult.deletedCount === 0) {
			return new Response("Mesocycle not found", {
				status: 404
			});
		}

		return new Response("Mesocycle deleted successfully", {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
