import { betterAuth } from 'better-auth';
import { pool } from './pool.js';
import { anonymous, emailOTP } from 'better-auth/plugins';
import { sendOTPEmail } from '../src/mailer.js';
import { env } from './env.js';

export const auth = betterAuth({
	// better-auth's tables (user/session/account/verification) are defined in
	// packages/shared/src/schema.prisma with the exact names and columns it expects.
	database: pool,
	trustedOrigins: env.TRUSTED_ORIGINS,
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
