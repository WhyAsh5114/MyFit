import { goto } from '$app/navigation';
import { resetDb, type DbClient } from '$lib/clients/idb-client';
import { clearPullCursor } from '$lib/features/sync-cursor';
import type { Session, User } from 'better-auth';
import { toast } from 'svelte-sonner';

type AuthSessionData = {
	user: User;
	session: Session;
};

export async function getCachedUserOnClient(db: DbClient, sessionData: AuthSessionData | null) {
	const existingUser = sessionData?.user?.id
		? await db.orm.user.where({ id: sessionData.user.id }).first()
		: null;

	return { existingUser };
}

export async function getOfflineUser(db: DbClient) {
	const offlineUser = await db.orm.user.first();
	return offlineUser;
}

export async function resetDatabaseState() {
	await resetDb();
	clearPullCursor();
}

export async function redirectToLogin(url: URL) {
	await resetDatabaseState();
	const redirect = `${url.pathname}${url.search}${url.hash}`;

	// eslint-disable-next-line svelte/no-navigation-without-resolve
	goto(`/login?redirect=${encodeURIComponent(redirect)}`);
	return toast.info('Please login to continue');
}

const DEFAULT_MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export async function createUserForCurrentSession(db: DbClient, sessionData: AuthSessionData) {
	if (sessionData?.user) {
		// The server already owns this row, so it must not be pushed back through the outbox.
		const { id, name, email, emailVerified, image, createdAt, updatedAt } = sessionData.user;
		await db.withoutTracking((orm) =>
			orm.user.create({
				id,
				name,
				email,
				emailVerified,
				image: image ?? null,
				createdAt,
				updatedAt,
				isAnonymous: null
			})
		);

		// Seed default meals for brand new users (existing users have a name set)
		if (sessionData.user.name.trim() === '') {
			await Promise.all(
				DEFAULT_MEALS.map((name, index) =>
					db.orm.meal.create({ name, sortOrder: index, userId: sessionData.user.id })
				)
			);
		}
	}
}
