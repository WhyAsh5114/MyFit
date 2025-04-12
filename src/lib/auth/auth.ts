import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from '$env/static/private';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { anonymous } from 'better-auth/plugins';

const prisma = new PrismaClient();
export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: 'postgresql' }),
	socialProviders: { google: { clientId: AUTH_GOOGLE_ID, clientSecret: AUTH_GOOGLE_SECRET } },
	plugins: [anonymous()],
	trustedOrigins: [
		'http://localhost:5173',
		'http://localhost:4173',
		'https://localhost',
		'https://my-fit-v4.vercel.app'
	]
});
