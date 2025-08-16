#!/usr/bin/env node

import { randomBytes } from 'crypto';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Script to populate a default .env file if one doesn't already exist.
 * This is useful for dev containers and fresh setups.
 */

const envPath = join(process.cwd(), '.env');

// Check if .env already exists
if (existsSync(envPath)) {
	console.log('✅ .env file already exists, skipping creation');
	process.exit(0);
}

// Generate a secure random secret for BETTER_AUTH_SECRET
const generateSecret = (): string => {
	return randomBytes(32).toString('hex');
};

// Default environment variables
const defaultEnvContent = `# Database configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myfit

# Better Auth configuration
BETTER_AUTH_SECRET=${generateSecret()}

# Add other environment variables as needed
`;

try {
	writeFileSync(envPath, defaultEnvContent, 'utf8');
	console.log('✅ Created .env file with default configuration');
	console.log('📝 You may need to adjust the DATABASE_URL and other settings for your environment');
} catch (error) {
	console.error('❌ Failed to create .env file:', error);
	process.exit(1);
}
