import { Resend } from 'resend';
import { env } from '../lib/env.js';

const resend = new Resend(env.RESEND_API_KEY!);

export function sendOTPEmail(to: string, otp: string) {
	return resend.emails.send({
		from: 'auth@login.myfit.fit',
		to,
		subject: 'Your OTP',
		html: `<p>Your OTP is: ${otp}</p>`
	});
}
