import * as Prisma from "@prisma/client";
import type { DBSchema } from "idb";

export interface PrismaIDBSchema extends DBSchema {
    ExerciseSplit: {
            key: [name: Prisma.ExerciseSplit['name'],userId: Prisma.ExerciseSplit['userId']];
            value: Prisma.ExerciseSplit;
        };
    ExerciseSplitDay: {
            key: [exerciseSplitName: Prisma.ExerciseSplitDay['exerciseSplitName'],dayIndex: Prisma.ExerciseSplitDay['dayIndex'],userId: Prisma.ExerciseSplitDay['userId']];
            value: Prisma.ExerciseSplitDay;
        };
    ExerciseSplitDaySession: {
            key: [exerciseSplitName: Prisma.ExerciseSplitDaySession['exerciseSplitName'],dayIndex: Prisma.ExerciseSplitDaySession['dayIndex'],sessionIndex: Prisma.ExerciseSplitDaySession['sessionIndex'],userId: Prisma.ExerciseSplitDaySession['userId']];
            value: Prisma.ExerciseSplitDaySession;
        };
    Exercise: {
            key: [splitName: Prisma.Exercise['splitName'],splitDayIndex: Prisma.Exercise['splitDayIndex'],sessionIndex: Prisma.Exercise['sessionIndex'],exerciseIndex: Prisma.Exercise['exerciseIndex'],userId: Prisma.Exercise['userId']];
            value: Prisma.Exercise;
        };
    User: {
            key: [id: Prisma.User['id']];
            value: Prisma.User;
            indexes: 
            {
                emailIndex: [email: Prisma.User['email']]
            }
        };
    Session: {
            key: [id: Prisma.Session['id']];
            value: Prisma.Session;
            indexes: 
            {
                tokenIndex: [token: Prisma.Session['token']]
            }
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
