import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import github from '@auth/core/providers/github';
import google from '@auth/core/providers/google';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { createTRPCHandle } from 'trpc-sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

const prisma = new PrismaClient();

const { handle: authHandle } = SvelteKitAuth({
	adapter: PrismaAdapter(prisma),
	basePath: '/auth',
	providers: [google, github],
	trustHost: true,
	callbacks: {
		session({ session, user }) {
			session.userId = user.id;
			return session;
		}
	}
});

export const handle = sequence(authHandle, createTRPCHandle({ router, createContext }));
