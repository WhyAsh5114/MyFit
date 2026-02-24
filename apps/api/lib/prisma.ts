import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL as string;

const adapter = new PrismaPg({ connectionString, ssl: false });
export const prisma = new PrismaClient({ adapter });
