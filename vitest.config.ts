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
            TEST_USERNAME: process.env.TEST_USER_USERNAME ?? '',
            TEST_PASSWORD: process.env.TEST_USER_PASSWORD ?? '',
        },
    },
});