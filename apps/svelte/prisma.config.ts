import { defineConfig } from 'prisma/config';
import "dotenv/config";

export default defineConfig({
	schema: './prisma/schema',
	migrations: {
		seed: `tsx ./prisma/seed.ts`
	},

});
