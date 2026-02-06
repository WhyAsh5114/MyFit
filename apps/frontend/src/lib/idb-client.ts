import { browser } from '$app/environment';
import { PrismaIDBClient } from '@myfit/db/prisma-idb/client';

let client: PrismaIDBClient;

async function initializeClient() {
	if (!browser) throw new Error('PrismaIDBClient can only be initialized in the browser');
	client = await PrismaIDBClient.createClient();
}

export { initializeClient, client };
