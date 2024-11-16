// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

const uri = MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient> | undefined;

if (process.env.NODE_ENV === 'development' && uri) {
	/*
	 * In development mode, use a global variable so that the value
	 * Is preserved across module reloads caused by HMR (Hot Module Replacement).
	 */
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, options);
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else if (uri) {
	// In production mode, it's best to not use a global variable.
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

/*
 * Export a module-scoped MongoClient promise. By doing this in a
 * separate module, the client can be shared across functions.
 */
export default clientPromise;
