import { expect } from 'vitest';

export function expectRejected(status: number) {
    expect([400, 401, 403, 404, 429]).toContain(status);
}