import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env.js';

const connectionString = env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString, ssl: false });
export const prisma = new PrismaClient({ adapter });
