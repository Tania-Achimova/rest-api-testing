const BASE_URL = process.env.BASE_URL;
const TEST_USER_USERNAME = process.env.TEST_USER_USERNAME;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

if (!BASE_URL) {
    throw new Error('Missing env var: BASE_URL — copy .env.example to .env');
}

if (!TEST_USER_USERNAME) {
    throw new Error('Missing env var: TEST_USER_USERNAME — copy .env.example to .env');
}

if (!TEST_USER_PASSWORD) {
    throw new Error('Missing env var: TEST_USER_PASSWORD — copy .env.example to .env');
}

export const config = { BASE_URL, TEST_USER_USERNAME, TEST_USER_PASSWORD } as const;
