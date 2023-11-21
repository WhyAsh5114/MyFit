import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type { PerformedMesocycleDocument, ActiveMesocycleDocument } from "$lib/types/documents";

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return new Response("Invalid session", {
			status: 403
		});
	}

	const { activeMesocycleId }: APIMesocyclesStopMesocycle = await request.json();
	const client = await clientPromise;

	try {
		const activeMesocycle = await client
			.db()
			.collection<ActiveMesocycleDocument>("activeMesocycles")
			.findOne({
				_id: new ObjectId(activeMesocycleId),
				userId: new ObjectId(session.user.id)
			});

		// Check if active mesocycle exists
		if (activeMesocycle === null) {
			return new Response("Active mesocycle not found", {
				status: 404
			});
		}

		if (activeMesocycle.workouts.length === 0) {
			await client
				.db()
				.collection<ActiveMesocycleDocument>("activeMesocycles")
				.deleteOne({ _id: new ObjectId(activeMesocycleId) });

			return new Response("Stopped successfully. Not saved as no workouts performed", {
				status: 200
			});
		}

		const { _id, ...activeMesocycleProps } = activeMesocycle;
		await client
			.db()
			.collection<PerformedMesocycleDocument>("performedMesocycles")
			.insertOne({
				...activeMesocycleProps,
				endTimestamp: +new Date()
			});

		return new Response("Stopped successfully. Saved in performed mesocycles", {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
