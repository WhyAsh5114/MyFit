import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY!);

export function sendOTPEmail(to: string, otp: string) {
  return resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: "Your OTP",
    html: `<p>Your OTP is: ${otp}</p>`,
  });
}
