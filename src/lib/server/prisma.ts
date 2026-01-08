import { DATABASE_URL } from '$env/static/private';
import { PrismaClient } from '$lib/server/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter: new PrismaPg({
			connectionString: DATABASE_URL,
			ssl: {
				rejectUnauthorized: false
			}
		})
	}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
