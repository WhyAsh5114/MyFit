import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@myfit/db";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL as string;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
