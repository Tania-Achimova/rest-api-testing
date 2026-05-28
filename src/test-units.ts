import { expect } from 'vitest';

export function expectRejected(status: number) {
    expect([400, 401, 429]).toContain(status);
}