import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type { MesocycleDocument } from "$lib/types/documents";

export const POST: RequestHandler = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return new Response("Invalid session", {
			status: 403
		});
	}

	const client = await clientPromise;
	try {
		const activeMesocycle = await client
			.db()
			.collection<MesocycleDocument>("mesocycles")
			.findOne({
				userId: new ObjectId(session.user.id),
				endTimestamp: { $exists: false }
			});

		if (!activeMesocycle) {
			return new Response("No active mesocycle found", { status: 400 });
		}

		await client
			.db()
			.collection<MesocycleDocument>("mesocycles")
			.updateOne({ _id: activeMesocycle._id }, { $push: { workouts: null } });

		return new Response("Rest day completed successfully", {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
