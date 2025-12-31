import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, BETTER_AUTH_SECRET } from '$env/static/private';
import { prisma } from '$lib/server/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { anonymous } from 'better-auth/plugins';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	socialProviders: { google: { clientId: AUTH_GOOGLE_ID, clientSecret: AUTH_GOOGLE_SECRET } },
	plugins: [anonymous()],
	secret: BETTER_AUTH_SECRET
});
