import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
	schema: './prisma/schema',
	migrations: {
		path: './prisma/migrations',
		seed: 'tsx ./prisma/seed.ts'
	}
});
