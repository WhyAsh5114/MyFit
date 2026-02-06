import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma.js';
import { anonymous } from 'better-auth/plugins';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	trustedOrigins: JSON.parse(process.env.TRUSTED_ORIGINS!),
	plugins: [anonymous()],
	advanced: {
		defaultCookieAttributes: {
			secure: true,
			sameSite: 'None'
		}
	}
});
