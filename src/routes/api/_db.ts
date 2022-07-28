import { createClient } from 'redis';
import { v4 as uuid } from 'uuid';
import { compare, hash } from 'bcrypt';

const db = createClient();
db.connect();

export const getUser = async (username: string): Promise<UserData> => {
	const existingUser = await db.get(username);
	if (!existingUser) {
		return Promise.reject(new Error('User does not exist'));
	}
	const user: User = JSON.parse(existingUser);
	delete user.password;
	return Promise.resolve(user);
};

export const setUser = async (userData: UserData, session: string): Promise<string> => {
	const existingUser = await db.get(userData.username);
	// Make sure user exists
	if (!existingUser) {
		return Promise.reject(new Error('User does not exist'));
	}
	// Reject if session is unauthorized (expired/corrupted)
	if (await getUsernameFromSession(session) !== userData.username) {
		return Promise.reject(new Error('Unauthorized session'));
	}
	await db.set(userData.username, JSON.stringify(userData));
	return Promise.resolve('User set successfully');
}

export const registerUser = async (credentials: AccountDetails): Promise<UserData> => {
	const existingUser = await db.get(credentials.username);
	if (existingUser) {
		return Promise.reject(new Error('User already exists'));
	}
	const hashedPassword = await hash(credentials.password, 10);
	const newUser: User = {
		username: credentials.username,
		password: hashedPassword,
		splits: {}
	};

	await db.set(newUser.username, JSON.stringify(newUser));
	delete newUser.password;
	return Promise.resolve(newUser);
};

export const loginUser = async ({ username, password }: AccountDetails): Promise<string> => {
	const userData = await db.get(username);
	if (!userData) {
		return Promise.reject(new Error('User does not exist'));
	}
	const existingUser: User = JSON.parse(userData);
	if (existingUser.password && (await compare(password, existingUser.password))) {
		const sessionID = await createSession(username);
		return Promise.resolve(sessionID);
	} else {
		return Promise.reject(new Error('Incorrect password'));
	}
};

export const createSession = async (username: string): Promise<string> => {
	const sessionID = uuid();
	await db.set(sessionID, username);
	await db.expire(sessionID, 60 * 60 * 24 * 7);
	return Promise.resolve(sessionID);
};

export const getUsernameFromSession = async (sessionID: string): Promise<string> => {
	const username = await db.get(sessionID);
	if (!username) {
		return Promise.reject(new Error('User does not exist'));
	}
	return Promise.resolve(username);
};

export const removeSession = async (sessionID: string): Promise<string> => {
	const username = await db.get(sessionID);
	if (!username) {
		return Promise.reject(new Error('Session not found'));
	}
	await db.del(sessionID);
	return Promise.resolve(sessionID);
};
