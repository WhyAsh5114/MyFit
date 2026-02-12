import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma.js';
import { anonymous, emailOTP } from 'better-auth/plugins';
import { sendOTPEmail } from '../src/mailer.js';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	trustedOrigins: JSON.parse(process.env.TRUSTED_ORIGINS!),
	plugins: [
		anonymous(),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (type === 'sign-in') {
					await sendOTPEmail(email, otp);
				}
			}
		})
	],
	advanced: {
		defaultCookieAttributes: {
			sameSite: 'none',
			secure: true,
			partitioned: true
		}
	}
});
