import * as Prisma from '@prisma/client';
import type { DBSchema } from 'idb';

export interface PrismaIDBSchema extends DBSchema {
	ExerciseSplit: {
		key: [id: Prisma.ExerciseSplit['id']];
		value: Prisma.ExerciseSplit;
	};
	User: {
		key: [id: Prisma.User['id']];
		value: Prisma.User;
		indexes: {
			emailIndex: [email: Prisma.User['email']];
		};
	};
	Session: {
		key: [id: Prisma.Session['id']];
		value: Prisma.Session;
		indexes: {
			tokenIndex: [token: Prisma.Session['token']];
		};
	};
	Account: {
		key: [id: Prisma.Account['id']];
		value: Prisma.Account;
	};
	Verification: {
		key: [id: Prisma.Verification['id']];
		value: Prisma.Verification;
	};
}
