import type { MongoClient } from 'mongodb';

declare global {
	var _mongoClientPromise: Promise<MongoClient>;
}
