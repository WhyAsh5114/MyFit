import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous } from "better-auth/plugins";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL env var not set!");
}

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID_V4!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_V4!,
    },
  },
  emailAndPassword: { enabled: true },
  plugins: [anonymous({ emailDomainName: "myfit-v4.com" })],
  trustedOrigins: [process.env.FRONTEND_URL!],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});
