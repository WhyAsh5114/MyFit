import { browser } from '$app/environment';
import { PrismaIDBClient } from '@myfit/api/prisma-idb/client';

let client: PrismaIDBClient | undefined;
let initPromise: Promise<PrismaIDBClient> | undefined;

async function initializeClient() {
	if (!browser) throw new Error('PrismaIDBClient can only be initialized in the browser');
	if (!initPromise) {
		initPromise = PrismaIDBClient.createClient().then((c) => (client = c));
	}
	await initPromise;
	return client;
}

function getClient(): PrismaIDBClient {
	if (!client) throw new Error('PrismaIDBClient not initialized. Call initializeClient() first.');
	return client;
}

export { initializeClient, getClient };
