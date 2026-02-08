import { goto } from '$app/navigation';
import type { PrismaIDBClient } from '@myfit/api/prisma-idb/client';
import type { Session, User } from 'better-auth';
import { toast } from 'svelte-sonner';

type AuthSessionData = {
	user: User;
	session: Session;
};

export async function getExistingUser(
	client: PrismaIDBClient,
	sessionData: AuthSessionData | null
) {
	const existingUser = sessionData?.user?.id
		? await client.user.findUnique({ where: { id: sessionData.user.id } })
		: null;

	return { sessionData, existingUser };
}

export async function getOfflineUser(client: PrismaIDBClient) {
	const offlineUser = await client.user.findFirst();
	return offlineUser;
}

export async function resetDatabaseState(client: PrismaIDBClient) {
	localStorage.removeItem('lastSyncedAt');
	await client.resetDatabase();
}

export async function redirectToLogin(client: PrismaIDBClient, url: URL) {
	await resetDatabaseState(client);
	const redirect = `${url.pathname}${url.search}${url.hash}`;

	// eslint-disable-next-line svelte/no-navigation-without-resolve
	goto(`/login?redirect=${encodeURIComponent(redirect)}`);
	return toast.info('Please login to continue');
}

export async function createUserForCurrentSession(
	client: PrismaIDBClient,
	sessionData: AuthSessionData
) {
	if (sessionData?.user) {
		await client.user.create({ data: sessionData.user }, { addToOutbox: false });
	}
}
