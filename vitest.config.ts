import { defineConfig } from 'vitest/config';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, '.env') });

export default defineConfig({
    test: {
        globals: true,
        testTimeout: 15000,
        reporters: ['verbose'],
        fileParallelism: false,
        env: {
            BASE_URL: process.env.BASE_URL ?? '',
            TEST_USER_USERNAME: process.env.TEST_USER_USERNAME ?? '',
            TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD ?? '',
            DATABASE_URL: process.env.DATABASE_URL ?? '',
        },
    },
});