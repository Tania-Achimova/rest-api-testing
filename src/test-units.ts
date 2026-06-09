import { expect } from 'vitest';

export function expectRejected(status: number) {
    expect([400, 401]).toContain(status);
}