const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) {
    throw new Error('Missing env var: BASE_URL — copy .env.example to .env');
}
export const config = { BASE_URL } as const;