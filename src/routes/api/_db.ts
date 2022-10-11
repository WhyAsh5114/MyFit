import { createClient } from 'redis';
import { v4 as uuid } from 'uuid';
import { compare, hash } from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const db = createClient({
    url: process.env.REDIS_URL
});
db.connect();

// ! Whenever returning Promise<User>, delete password property first

export const getUser = async (username: string): Promise<User> => {
    const existingUser = await db.get(username);
    if (!existingUser) {
        return Promise.reject(new ErrorResponse('User does not exist', 404));
    }
    const user: User = JSON.parse(existingUser);
    delete user.password;
    return Promise.resolve(user);
};

export const setUser = async (userData: User, session: string): Promise<string> => {
    const existingUser = await db.get(userData.username);
    // Make sure user exists
    if (!existingUser) {
        return Promise.reject(new ErrorResponse('User does not exist', 404));
    }
    // Reject if session is unauthorized (expired/corrupted)
    if ((await getUsernameFromSession(session)) !== userData.username) {
        return Promise.reject(new ErrorResponse('Unauthorized session', 403));
    }
    // Get password from DB and set it to passed data
    // * Remember the password is deleted when coming from application
    const userPassword: string = JSON.parse(existingUser).password;
    userData.password = userPassword;
    // Then updated database to this new userData with the password
    await db.set(userData.username, JSON.stringify(userData));
    return Promise.resolve('User set successfully');
};

export const registerUser = async (credentials: AccountDetails): Promise<User> => {
    const existingUser = await db.get(credentials.username);
    if (existingUser) {
        return Promise.reject(new ErrorResponse('User already exists', 409));
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
        return Promise.reject(new ErrorResponse('User does not exist', 404));
    }
    const existingUser: User = JSON.parse(userData);
    if (existingUser.password && (await compare(password, existingUser.password))) {
        const sessionID = await createSession(username);
        return Promise.resolve(sessionID);
    } else {
        return Promise.reject(new ErrorResponse('Incorrect password', 403));
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
        return Promise.reject(new ErrorResponse('User does not exist', 404));
    }
    return Promise.resolve(username);
};

export const getUserFromSession = async (sessionID: string): Promise<User> => {
    const username = await getUsernameFromSession(sessionID);
    const user = await getUser(username);
    delete user.password;
    return user;
};

export const removeSession = async (sessionID: string): Promise<string> => {
    const username = await db.get(sessionID);
    if (!username) {
        return Promise.reject(new ErrorResponse('Session not found', 404));
    }
    await db.del(sessionID);
    return Promise.resolve(sessionID);
};

export class ErrorResponse {
    constructor(public message: string, public status: number) {}
}
