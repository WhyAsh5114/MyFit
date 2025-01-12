import { PrismaIDBClient } from "@/prisma/prisma-idb/prisma-idb-client";
import { create } from "zustand";

type PIDBState = {
  client: undefined | null | PrismaIDBClient;
  createClient: () => void;
};

export const usePidbClient = create<PIDBState>((set, get) => ({
  client: null,
  createClient: async () => {
    if (get().client !== null) return;
    set({ client: undefined });
    const client = await PrismaIDBClient.createClient();
    set({ client });
  },
}));
